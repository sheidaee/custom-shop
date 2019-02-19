const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')

const { promisify } = require('util')

const {transport, makeANiceEmail} = require('../mail')
const { hasPermission } = require('../utils')
const strip = require('../stripe')

const mutations = {  
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!')
    }

    const item = await ctx.db.mutation.createItem({
      data: {
        user: {
          connect: {
            id: ctx.request.userId
          }
        },
        ...args,      
      }
    }, info)

    return item
  },
  updateItem(parent, args, ctx, info) {
    const updates = {...args}

    delete updates.id
        
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)     
  },
  async deleteItem(parent, args, ctx, info) {    
    const where = {id: args.id}
    // 1. find the item
    const item = await ctx.db.query.item( {where}, `{ id, title user{ id } }` )

    // 2. check if they own that item, or have the permissions
    const owensItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(
      permission => ['ADMIN', 'ITEMDELETE'].includes(permission)
    ) 
    if (!owensItem && hasPermissions)   {
      throw new Error("You don't have permission to do")
    }

    // 3. delete it!
    return ctx.db.mutation.deleteItem({where}, info)
  },
  async signup(parent, args, ctx, info) {    
    args.email = args.email.toLowerCase()

    // hash their password
    const password = await bcrypt.hash(args.password, 10)
    
    // create the user in the database    
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: {set: ['USER']}
      } // name, email and password
    }, info)

    // create the JWT token
    const token = jwt.sign({
      userId: user.id      
    },
    process.env.APP_SECRET)

    // set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {      
      httpOnly: true, /* accessible only on network and not js in client side*/
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  },
  async signin(parent, {email, password}, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({where: {email}})

    if(!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    // check if the password is correct
    const valid = await bcrypt.compare(password, user.password)
    if(!valid) {
      throw new Error('Invalid password')
    }

    // generate the JWT token
    const token = jwt.sign({
      userId: user.id      
    },
    process.env.APP_SECRET)

    // set the cookies with the token
    ctx.response.cookie('token', token, {      
      httpOnly: true, /* accessible only on network and not js in client side*/
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    // return the user
    return user;
  },
  signout(parent, args, ctx, info) {    
    ctx.response.clearCookie('token')
    
    return { message: 'Goodbye!' }
  },
  async requestReset(parent, args, ctx, info) {    
    // check if this is a real user
    const user = await ctx.db.query.user({
      where: {email: args.email}
    })
    if(!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    // set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes)
    const resetToken = (await randomBytesPromiseified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: {email: args.email},
      data: {resetToken, resetTokenExpiry}
    })

    // console.log(res);
    
    // Email them that reset token
    const mailRes = await transport.sendMail({
      from: 'sh@shahin.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is
      here \n\n 
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a> `)
    })
    // return the message
    return { message: 'Thanks' }
  },
  async resetPassword(parent, {resetToken, password, confirmPassword}, ctx, info) {
    // check if the password match
    if (password !== confirmPassword) {
      throw new Error('Yo Passwords do not match')
    }

    // check if its a legit reset token
    // check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })

    if(!user) {
      throw new Error('This token is either invalid or expired')
    }      

    // hash the new password    
    const newPassword = await bcrypt.hash(password, 10)

    // save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {email: user.email},
      data: {
        password: newPassword, 
        resetToken: null, 
        resetTokenExpiry: null}
    })

    // generate JWT
    const token = jwt.sign({
      userId: updatedUser.id      
    },
    process.env.APP_SECRET)

    // set the jwt cookie
    ctx.response.cookie('token', token, {      
      httpOnly: true, /* accessible only on network and not js in client side*/
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    // return the new user
    return updatedUser;    
  },
  async updatePermissions(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in')
    }

    // query the current user
    const currentUser = await ctx.db.query.user({
      where: {
        id: ctx.request.userId
      }
    }, info)

    // check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    // update the permissions
    return ctx.db.mutation.updateUser({
      data: { permissions: {
        set: args.permissions
      } },
      where: {
        id: args.userId
      }
    }, info)
  },
  async addToCart(parent, args, ctx, info){
    // make sure they are signed in    
    const {userId} = ctx.request
    if (!userId) {
      throw new Error('You must be signed in sooon!')
    }
    // query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: {id: userId},
        item: {id: args.id}
      }
    })

    // check if that item is already in their cart and increment by one if it is
    if (existingCartItem) {
      console.log('This item is in their cart');
      return ctx.db.mutation.updateCartItem({
        where: {id: existingCartItem.id},
        data: {quantity: existingCartItem.quantity + 1}
      }, 
      info)
    }

    // if its not, create a fresh cart item for that user
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: {id: userId}
        },
        item: {
          connect: {id: args.id}
        }
      }
    }, 
    info)
  },
  async removeFromCart(parent, args, ctx, info) {
    // query the users current cart
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id
      }
    }, `{id, user {id}}`)

    // make sure they owen that cart item
    if (!cartItem) {
      throw new Error('No CartItem Found!')
    }

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huhhhhh!')
    }

    // delete that cart item    
    return ctx.db.mutation.deleteCartItem({
       where: {id: cartItem.id }
    }, info)
  },
  async createOrder(parent, args, ctx, info) {
    // 1 query the current user and make sure they are signed in
    const { userId } = ctx.request

    if (!userId) throw new Error('You must be signed in to complete this order')

    const user = await ctx.db.query.user({
      where: { id: userId }      
    }, 
    `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
      )

    
    // 2 recalculate the total for the price
    const amount = user.cart.reduce(
      ((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity)
      , 0)
    
    console.log(`Going to charge for a total of ${amount}`);
    
    // 3 Create the Strip change - (turn token into $$$)
    const charge = await strip.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    })

    // 4 Convert the cartItems to OrderItems  
    const orderItems = user.cart.map( cartItem => {
      const { title, description, image, largeImage, price } = cartItem.item;      
      
      return({
        title, description, image, largeImage, price,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      })
    })

    // 5 Create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {     
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: {
          connect: {  id: userId }
        },
    }})    

    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({ 
      where: {
        id_in: cartItemIds
      }
    })

    return order;
  }
};

module.exports = mutations;

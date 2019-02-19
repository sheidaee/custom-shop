const { forwardTo } = require('prisma-binding')
const { hasPermission} = require('../utils')

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user id
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user({
      where: {id: ctx.request.userId},
    }, info)
  }, 
  async users(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged it')
    }

    // check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PREMISSIONUPDATE'])

    // if they do, query, all the users 
    return ctx.db.query.users({}, info)
  },
  async order(parent, args, ctx, info) {
    // make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('You are not logged in!')
    }
    // query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id }
    }, info)
    //check if they have the permissions to see the order
    const ownsOrder = order.user.id === ctx.request.userId
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN')

    if(!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error('You cant see this buddd')
    }
    // return the order
    return order
  },
  async orders(parent, args, ctx, info) {
    const {userId} = ctx.request
    // make sure they are logged in
    if (!userId) {
      throw new Error('You are not logged in!')
    }
    // query the current order
    const orders = await ctx.db.query.orders({
      where: { 
        user: {
          id: userId
        } 
      }
    }, info)
          
    return orders
  }  
};

module.exports = Query;

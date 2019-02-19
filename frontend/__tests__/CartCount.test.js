import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CartCount from '../components/CartCount';

describe('<CartCount/>', () => {
  let wrapper;

  beforeAll(() => {
    wrapper = shallow(<CartCount count={10} />);    
  })

 it('renders', () => {
  shallow(<CartCount count={10} />)
 })

 it('matches the snapshot', () => {  
  expect(toJSON(wrapper)).toMatchSnapshot();
 })

 it('updates via props', () => {
  wrapper = shallow(<CartCount count={10} />);    
  expect(toJSON(wrapper)).toMatchSnapshot();
  wrapper.setProps({ count: 10 });
  expect(toJSON(wrapper)).toMatchSnapshot();
 })
})


import { mount } from 'enzyme';
import wait from "waait";
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import Order, { SINGLE_ODER_QUERY } from '../components/Order';
import { fakeOrder } from '../lib/testUtils';

const mocks = [  
  {
    request: {
      query: SINGLE_ODER_QUERY, variables: { id: 'ord123' }
    },
    result: {
      data: {
        order: fakeOrder()
      }
    }
  }
];

describe('<Order />', () => {
 it('renders and matches snapshot', async() => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id="ord123" />      
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    
    expect(toJSON(wrapper.find('div[data-test="order"]'))).toMatchSnapshot();      
 })

 it('display the order information', async() => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id="ord123" />      
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    
    expect(wrapper.find('[data-test="order-total"]').text()).toBe('$400');
    expect(wrapper.find('[data-test="item-count"]').text()).toBe('2');
 })
})
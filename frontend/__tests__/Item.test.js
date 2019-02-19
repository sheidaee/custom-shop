import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: '123456',
  title: 'The title',
  price: 100,
  description: 'The description',
  image: 'item.jpg',
  largeImage: 'large-image.jpg'
}

describe('<Item />', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = shallow(<ItemComponent item={fakeItem} />);
  })

  it('renders and matches the snapshot', () => {
  expect(toJSON(wrapper)).toMatchSnapshot();
  
  })
})
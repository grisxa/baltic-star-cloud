import {
  Button,
  Col,
  Collapse,
  CollapseItem,
  Container,
  Dropdown,
  DropdownMenu,
  Footer,
  Header,
  Icon,
  Loading,
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Option,
  Row,
  Select,
  Submenu,
} from 'element-ui';
import Vue from 'vue';

const elements = [
  Button,
  Col,
  Collapse,
  CollapseItem,
  Container,
  Dropdown,
  DropdownMenu,
  Footer,
  Header,
  Icon,
  Loading,
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Option,
  Row,
  Select,
  Submenu,
];

elements.forEach((element) => Vue.use(element));

export default elements;

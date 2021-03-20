import {
  Button,
  Col,
  Collapse,
  CollapseItem,
  Container,
  Footer,
  Header,
  Icon,
  Loading,
  Main,
  Option,
  Row,
  Select,
} from 'element-ui';
import Vue from 'vue';

const elements = [
  Button,
  Icon,
  Collapse,
  CollapseItem,
  Loading,
  Container,
  Header,
  Main,
  Footer,
  Col,
  Row,
  Select,
  Option,
];

elements.forEach((element) => Vue.use(element));

export default elements;

import { createApp } from 'vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'ant-design-vue';

createApp(App).use(Button).use(Form).use(Input).use(DatePicker).use(Select).use(Row).use(Col).mount('#app');

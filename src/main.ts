import { createApp } from 'vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import { Button, DatePicker, Form, Input, Select } from 'ant-design-vue';

createApp(App).use(Button).use(Form).use(Input).use(DatePicker).use(Select).mount('#app');

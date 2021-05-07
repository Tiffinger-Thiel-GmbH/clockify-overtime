<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br />
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="Clockify API key">
        <a-input v-model:value="formState.apiKey" @change="onChangeApiKey" />
      </a-form-item>
      <a-form-item label="Workspace">
        <a-select v-model:value="formState.workspace" placeholder="please select workspace">
          <a-select-option v-for="ws in workspaces" :key="ws" :value="ws">{{ ws }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="Start date">
        <a-date-picker v-model:value="formState.startDate" show-time type="date" placeholder="Pick a date" style="width: 100%" />
      </a-form-item>
      <a-form-item label="End date">
        <a-date-picker v-model:value="formState.endDate" show-time type="date" placeholder="Pick a date" style="width: 100%" />
      </a-form-item>
      <a-form-item label="Working hours per week">
        <a-input v-model:value="formState.workingHours" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">Create</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRaw, UnwrapRef } from 'vue';
import moment, { Moment } from 'moment';

interface FormState {
  apiKey: string;
  workspace?: string;
  startDate?: Moment;
  endDate?: Moment;
  workingHours: number;
}

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String
  },
  setup() {
    const formState: UnwrapRef<FormState> = reactive({
      apiKey: '',
      startDate: moment().startOf('year'),
      endDate: moment(),
      workingHours: 40
    });
    const workspaces: string[] = ['Test'];
    const onChangeApiKey = () => {
      console.log(formState.apiKey);
    };
    const onSubmit = () => {
      console.log('submit!', toRaw(formState));
    };
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formState,
      workspaces,
      onChangeApiKey,
      onSubmit
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

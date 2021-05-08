<template>
  <div>
    <div class="header">
      <div>
        <a href="https://clockify.me/tracker">
          <img src="https://clockify.me/assets/images/clockify-logo.svg" alt="Clockify logo" />
        </a>
      </div>
      <div class="avatar" v-if="formState.userAvatarUrl">
        <img :src="formState.userAvatarUrl" alt="User Avatar" />
      </div>
    </div>
    <p>
      Enter your data below and click "Submit" to calculate overtime.<br />
      Disclaimer: This app does not have a backend 😉. Your data is only sent to the Clockify API.
    </p>
    <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="rules">
      <a-form-item required has-feedback label="Clockify API key" name="apiKey">
        <a-input v-model:value="formState.apiKey" />
      </a-form-item>
      <a-form-item required label="Workspace">
        <a-select v-model:value="formState.workspace" placeholder="please select workspace">
          <a-select-option v-for="ws in formState.workspaces" :key="ws.id" :value="ws.id">{{ ws.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item required label="Period">
        <a-range-picker :ranges="ranges" v-model:value="formState.period" style="width: 100%" />
      </a-form-item>
      <a-form-item required label="Working hours per week">
        <a-input v-model:value="formState.workingHours" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script src="./Overtime.ts" />

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
.header {
  display: flex;
  margin: 15px;
}
.avatar {
  flex-grow: 1;
  text-align: right;
}
.avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>

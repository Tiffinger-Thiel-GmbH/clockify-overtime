import { defineComponent, reactive, ref, toRaw, UnwrapRef } from 'vue';
import moment, { Moment } from 'moment';
import { ClockifyWorkspace, getCurrentUser, getWorkspaces } from '../clockifyApi';
import { RuleObject } from 'ant-design-vue/lib/form/interface';

interface FormState {
  apiKey: string;
  workspace?: string;
  period?: Moment[];
  workingHours: number;
  workspaces: ReadonlyArray<ClockifyWorkspace>;
  userAvatarUrl?: string;
}

interface SavedState {
  apiKey: string;
  workingHours: number;
}

export default defineComponent({
  name: 'Overtime',
  setup() {
    const savedValuesJSON = localStorage.getItem('overtimeFormState');
    const savedValues = savedValuesJSON ? (JSON.parse(savedValuesJSON) as SavedState) : undefined;

    const formRef = ref();
    const formState: UnwrapRef<FormState> = reactive({
      apiKey: savedValues?.apiKey || '',
      period: [moment().startOf('year'), moment()],
      workingHours: savedValues?.workingHours || 40,
      workspaces: []
    });
    const readWorkspaces = async (apiKey: string) => {
      const currentUser = await getCurrentUser(apiKey);
      const workspaces = await getWorkspaces(apiKey);
      formState.workspaces = workspaces;
      formState.workspace = currentUser.activeWorkspace;
      formState.userAvatarUrl = currentUser.profilePicture;
    };
    const validateApiKey = async (rule: RuleObject, value: string) => {
      if (value) {
        try {
          readWorkspaces(value);
        } catch (err) {
          throw new Error(err.message);
        }
      }
    };
    if (formState.apiKey) {
      //TODO how to do this properly?
      setTimeout(() => formRef.value.validateField('apiKey'), 100);
    }

    const onSubmit = () => {
      console.log('submit!', toRaw(formState));
      const valuesToSave: SavedState = {
        apiKey: formState.apiKey,
        workingHours: formState.workingHours
      };
      localStorage.setItem('overtimeFormState', JSON.stringify(valuesToSave));
    };

    const rules = {
      apiKey: [{ validator: validateApiKey, trigger: 'blur' }]
    };
    const ranges = {
      'This Month (so far)': [moment().startOf('month'), moment().subtract(1, 'day')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'This Year (so far)': [moment().startOf('year'), moment().subtract(1, 'day')],
      'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
    };

    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formRef,
      formState,
      rules,
      ranges,
      onSubmit
    };
  }
});

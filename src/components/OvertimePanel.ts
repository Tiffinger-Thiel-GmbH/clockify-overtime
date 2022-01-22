import { requestAndCalculateOvertime } from '@/calculate';
import { RuleObject } from 'ant-design-vue/lib/form/interface';
import moment, { Moment } from 'moment';
import { defineComponent, reactive, ref, toRaw, UnwrapRef, watch } from 'vue';
import { AllUsersResponse, ClockifyWorkspace, getAllUsers, getCurrentUser, getWorkspaces } from '../clockifyApi';

interface FormState {
  apiKey: string;
  workspace?: string;
  period?: Moment[];
  workingHours: number;
  workspaces: ReadonlyArray<ClockifyWorkspace>;
  userAvatarUrl?: string;
  currentUserId?: string;
  userId?: string;
  users: ReadonlyArray<AllUsersResponse>;
  isAdmin?: boolean;
  overtime?: { businessHours: number; allocatedHours: number; overtimeHours: number; isOver?: boolean; missingDates: string[] };
}

interface SavedState {
  apiKey: string;
  workingHours: number;
}

export default defineComponent({
  name: 'OvertimePanel',
  setup() {
    const savedValuesJSON = localStorage.getItem('overtimeFormState');
    const savedValues = savedValuesJSON ? (JSON.parse(savedValuesJSON) as SavedState) : undefined;

    const formRef = ref();
    const formState: UnwrapRef<FormState> = reactive({
      apiKey: savedValues?.apiKey || '',
      period: [moment().startOf('year'), moment()],
      workingHours: savedValues?.workingHours || 40,
      workspaces: [],
      users: []
    });
    const readWorkspaces = async (apiKey: string) => {
      const currentUser = await getCurrentUser(apiKey);
      const workspaces = await getWorkspaces(apiKey);
      formState.currentUserId = currentUser.id;
      formState.userId = currentUser.id;
      formState.workspaces = workspaces;
      formState.workspace = currentUser.activeWorkspace;
      formState.userAvatarUrl = currentUser.profilePicture;
    };
    const readUsers = async (workspaceId: string) => {
      const users = await getAllUsers(formState.apiKey, workspaceId);
      formState.users = users;
      formState.isAdmin = users.find((user) => user.id === formState.currentUserId)?.roles.some((role) => role.role === 'WORKSPACE_ADMIN');
    };
    watch(
      () => formState.workspace,
      async (worspaceId) => {
        if (worspaceId && formState.currentUserId && formState.apiKey) {
          formState.userId = formState.currentUserId;
          try {
            await readUsers(worspaceId);
          } catch (err) {
            console.error(err.message);
          }
        }
      }
    );
    const validateApiKey = async (rule: RuleObject, value: string) => {
      if (value) {
        try {
          await readWorkspaces(value);
        } catch (err) {
          throw new Error(err.message);
        }
      }
    };
    if (formState.apiKey) {
      //TODO how to do this properly?
      setTimeout(() => formRef.value.validateFields('apiKey'), 100);
    }

    const onSubmit = async () => {
      console.log('submit!', toRaw(formState));
      const valuesToSave: SavedState = {
        apiKey: formState.apiKey,
        workingHours: formState.workingHours
      };
      localStorage.setItem('overtimeFormState', JSON.stringify(valuesToSave));

      if (formState.userId && formState.workspace && formState.period) {
        const result = await requestAndCalculateOvertime(
          formState.apiKey,
          formState.userId,
          formState.workspace,
          formState.period[0].toDate(),
          formState.period[1].toDate(),
          formState.workingHours / 5
        );
        if (result) {
          formState.overtime = {
            businessHours: moment.duration(result.businessSeconds * 1000).asHours(),
            allocatedHours: moment.duration(result.allocatedSeconds * 1000).asHours(),
            overtimeHours: moment.duration(result.overtimeSeconds * 1000).asHours(),
            isOver: result.overtimeSeconds > 0,
            missingDates: result.missingDates.map((date) => moment(date).format('LL'))
          };
        } else {
          formState.overtime = undefined;
        }
      }
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

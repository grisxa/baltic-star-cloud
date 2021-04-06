<template>
  <div>
    <el-menu-item index="30" v-if="!isLoggedIn" @click="logIn">
      <i class="el-icon-user"></i>
      <span>{{ $t('LogInOut.login') }}</span>
    </el-menu-item>
    <el-menu-item index="31" v-if="isLoggedIn" @click="openProfile">
      <i class="el-icon-user"></i>
      <span>{{ $t('LogInOut.profile') }}</span>
    </el-menu-item>
    <el-menu-item index="32" v-if="isLoggedIn" @click="logOut">
      <i class="el-icon-guide"></i>
      <span>{{ $t('LogInOut.logout') }}</span>
    </el-menu-item>
  </div>
</template>

<script lang="ts">
import router from '@/router';
import {SetLogInMutation} from '@/store/models';
import {Component, Vue} from 'vue-property-decorator';
import {mapGetters} from 'vuex';

@Component({
  computed: {
    ...mapGetters(['isLoggedIn']),
  },
})
export default class LogInOut extends Vue {
  isLoggedIn!: boolean;

  // eslint-disable-next-line class-methods-use-this
  openProfile(): void {
    router.push('profile');
  }

  // eslint-disable-next-line class-methods-use-this
  logIn(): void {
    // FIXME : update status based on auth reply
    this.$store.commit(new SetLogInMutation(true));
    window.location.href = [process.env.VUE_APP_AWS_AUTH,
      '/login?client_id=', process.env.VUE_APP_AWS_CLIENT_ID,
      '&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile',
      '&redirect_uri=', process.env.VUE_APP_AWS_S3, '/after-login'].join('');
  }

  logOut(): void {
    // FIXME : update status based on auth reply
    this.$store.commit(new SetLogInMutation(false));
    window.location.href = [process.env.VUE_APP_AWS_AUTH,
      '/logout?client_id=', process.env.VUE_APP_AWS_CLIENT_ID,
      // '&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile',
      '&logout_uri=', process.env.VUE_APP_AWS_S3, '/after-logout'].join('');
  }

  switchLogin(): void {
    this.$store.commit(new SetLogInMutation(!this.isLoggedIn));
  }
}

Vue.component('app-login-out', LogInOut);
</script>

<style scoped lang="scss">
@include element-menu-item;
</style>

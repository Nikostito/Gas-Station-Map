<template>
<div id="signup">
<form>
  <fieldset>
    <div class="form-group">
      <label for="Username">Username</label>
      <input type="text" class="form-control" id="Username" placeholder="Enter username">
    </div>
    <div class="form-group">
      <label for="Password">Password</label>
      <input type="password" class="form-control" id="Password" placeholder="Enter Password">
    </div>
    </fieldset>
    <button type="submit" class="btn btn-secondary">Sign Up</button>
</form>
</div>
</template>
<script>
export default {
  name: 'signup'
};
</script>
<style lang="scss">
@import '../../css/variables.scss';
</style>
<style>
@import '../../css/bootstrap.css';
</style>

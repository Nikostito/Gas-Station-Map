<template>
<div id="home">
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
<a class="navbar-brand" href="/">Bits Please</a>
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
<span class="navbar-toggler-icon"></span>
</button>

<div class="collapse navbar-collapse" id="navbarColor01">
<ul class="navbar-nav mr-auto">
<li class="nav-item active">
  <a class="nav-link" href="/">Αρχικη <span class="sr-only">(current)</span></a>
</li>
<li class="nav-item">
  <a class="nav-link" href="/signup">Εγγραφη</a>
</li>
<li class="nav-item">
  <a class="nav-link" href="/login">Συνδεση</a>
</li>
<li class="nav-item">
  <a class="nav-link" href="#">Πρατηρια</a>
</li>
</ul>
<form class="form-inline my-2 my-lg-0">
<input class="form-control mr-sm-2" type="text" placeholder="Search">
<button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
</form>
</div>
</nav>
</div>
</template>
<script>
export default {
};
</script>
<style lang="scss">
@import '../../css/variables.scss';
</style>
<style>
@import '../../css/bootstrap.css';
</style>

<template>
  <transition name="modal-fade">
  <div class="modal-backdrop" @click="close">
    <div class="modal" @click.stop>
      <button
        type="button"
        class="btn-close flex justify-end"
        @click="close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <header class="modal-header">
        <slot name="header"></slot>
      </header>
      <section class="modal-body">
        <slot name="body"></slot>
       </section>
       <footer class="modal-footer">
          <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</transition>
</template>

<script>
  export default {
    name: 'Modal',
    data() {
      return {
      shouldShowModal: false
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
    },
  };
</script>

<style lang="scss">

  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .modal {
    background: #FFFFFF;
    margin: 20px;
    width: 95%;
    border-radius: 3px;
    max-width: 700px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    @media (min-width: 768px) {
      margin: 40px;
    }
  }

  .modal-footer {
    padding: 30px;
    display: flex;
  }

  .modal-header {
    padding: 0 30px 10px 30px;
  }

  .modal-header {
    justify-content: space-between;
  }

  .modal-footer {
    justify-content: flex-end;
  }

  .modal-body {
    position: relative;
    padding: 0 30px;
  }

  .btn-close {
    border: none;
    font-size: 20px;
    padding: 30px;
    cursor: pointer;
    background: transparent;
  }

  .modal-fade-enter,
  .modal-fade-leave-active {
    opacity: 0;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity .3s ease
  }


</style>

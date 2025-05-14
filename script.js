// script.js
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registrationForm');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const showPasswordTips = document.getElementById('showPasswordTips');
  const passwordTipsModal = document.getElementById('passwordTipsModal');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');
  const gotItButton = document.getElementById('gotItButton');
  const successToast = document.getElementById('successToast');
  const registerButton = document.getElementById('registerButton');
  
  // 切换密码可见性
  togglePassword.addEventListener('click', function() {
    togglePasswordVisibility(passwordInput, togglePassword);
  });
  
  toggleConfirmPassword.addEventListener('click', function() {
    togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
  });
  
  function togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    // 切换图标
    if (type === 'text') {
      button.innerHTML = '<i class="fa-solid fa-eye"></i>';
    } else {
      button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    }
  }
  
  // 显示密码提示
  showPasswordTips.addEventListener('click', function() {
    passwordTipsModal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
  });
  
  // 关闭密码提示
  function closePasswordTips() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      passwordTipsModal.classList.add('hidden');
    }, 300);
  }
  
  closeModal.addEventListener('click', closePasswordTips);
  gotItButton.addEventListener('click', closePasswordTips);
  
  // 点击模态框外部关闭
  passwordTipsModal.addEventListener('click', function(e) {
    if (e.target === passwordTipsModal) {
      closePasswordTips();
    }
  });
  
  // 实时验证密码
  passwordInput.addEventListener('input', function() {
    validatePassword();
  });
  
  confirmPasswordInput.addEventListener('input', function() {
    validateConfirmPassword();
  });
  
  // 表单提交验证
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // 验证名字
    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim()) {
      showError(firstName, '请输入有效的名字');
      isValid = false;
    } else {
      hideError(firstName);
    }
    
    // 验证姓氏
    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim()) {
      showError(lastName, '请输入有效的姓氏');
      isValid = false;
    } else {
      hideError(lastName);
    }
    
    // 验证邮箱
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      showError(email, '请输入有效的电子邮箱');
      isValid = false;
    } else {
      hideError(email);
    }
    
    // 验证密码
    if (!validatePassword()) {
      isValid = false;
    }
    
    // 验证确认密码
    if (!validateConfirmPassword()) {
      isValid = false;
    }
    
    // 验证条款同意
    const terms = document.getElementById('terms');
    if (!terms.checked) {
      showError(terms, '请同意服务条款和隐私政策');
      isValid = false;
    } else {
      hideError(terms);
    }
    
    // 如果验证通过
    if (isValid) {
      // 模拟提交
      registerButton.disabled = true;
      registerButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>正在注册...</span>';
      
      // 实际的API调用
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: passwordInput.value
        })
      })
      .then(response => response.json())
      .then(data => {
        // 处理响应
        if (response.ok) {
          // 显示成功提示
          successToast.classList.remove('translate-y-20', 'opacity-0');
          
          // 3秒后隐藏提示并跳转到登录页面
          setTimeout(function() {
            successToast.classList.add('translate-y-20', 'opacity-0');
            
            // 跳转到登录页面（修改后的路径）
            window.location.href = 'login.html';
            
            // 重置表单
            form.reset();
          }, 3000);
        } else {
          // 显示错误提示
          const errorField = data.field || 'email';
          const errorElement = document.getElementById(errorField);
          showError(errorElement, data.message || '注册失败，请重试');
          registerButton.disabled = false;
          registerButton.innerHTML = '<span>创建账户</span><i class="fa-solid fa-arrow-right ml-2"></i>';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showError(email, '网络错误，请重试');
        registerButton.disabled = false;
        registerButton.innerHTML = '<span>创建账户</span><i class="fa-solid fa-arrow-right ml-2"></i>';
      });
    }
  });
  
  // 验证密码
  function validatePassword() {
    const password = passwordInput.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      showError(passwordInput, '密码必须包含至少8个字符，包括大小写字母、数字和特殊字符');
      return false;
    } else {
      hideError(passwordInput);
      return true;
    }
  }
  
  // 验证确认密码
  function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (password !== confirmPassword || !confirmPassword) {
      showError(confirmPasswordInput, '两次输入的密码不一致');
      return false;
    } else {
      hideError(confirmPasswordInput);
      return true;
    }
  }
  
  // 显示错误
  function showError(element, message) {
    const parent = element.parentElement.parentElement;
    const errorMessage = parent.querySelector('.error-message');
    
    element.classList.add('border-red-500');
    element.classList.remove('focus:form-input-focus');
    element.classList.add('focus:border-red-500');
    element.classList.add('focus:ring-red-200');
    
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('hidden');
    }
  }
  
  // 隐藏错误
  function hideError(element) {
    const parent = element.parentElement.parentElement;
    const errorMessage = parent.querySelector('.error-message');
    
    element.classList.remove('border-red-500');
    element.classList.add('focus:form-input-focus');
    element.classList.remove('focus:border-red-500');
    element.classList.remove('focus:ring-red-200');
    
    if (errorMessage) {
      errorMessage.classList.add('hidden');
    }
  }
});
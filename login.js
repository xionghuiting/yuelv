// 登录页面 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面元素
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    
    // 初始化错误提示元素
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    const successToast = document.getElementById('successToast');
    
    // 密码显示/隐藏切换
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 切换图标
            const icon = passwordToggle.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // 表单提交处理
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    // 自动填充记住的邮箱
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
    }
});

// 登录函数
async function login() {
    const loginButton = document.getElementById('loginButton');
    const successToast = document.getElementById('successToast');
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const rememberMe = document.getElementById('remember').checked;

    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>正在登录...</span>';

    try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 简单验证
        if (!emailInput.value || !passwordInput.value) {
            throw new Error('请输入邮箱和密码');
        }

        // 存储记住的邮箱
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // 模拟存储token和用户信息
        localStorage.setItem('auth_token', 'simulated_token');
        const userData = {
            email: emailInput.value,
            name: emailInput.value.split('@')[0] // 使用邮箱前缀作为用户名
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('username', userData.name); // 单独存储用户名

        // 显示成功提示
        successToast.classList.remove('translate-y-20', 'opacity-0');

        // 3秒后跳转到首页界面
        setTimeout(() => {
            successToast.classList.add('translate-y-20', 'opacity-0');
            window.location.href = '首页.html'; // 确保路径正确
        }, 3000);
    } catch (error) {
        console.error('登录过程中发生错误:', error);
        showErrorToast(error.message || '登录失败，请检查您的凭证');
    } finally {
        setTimeout(() => {
            loginButton.disabled = false;
            loginButton.innerHTML = '<span>登录</span><i class="fa-solid fa-arrow-right ml-2"></i>';
        }, 1000);
    }
}

// 显示错误提示
function showErrorToast(message) {
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    if (errorToast) {
        errorToast.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            errorToast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

// 检查用户是否已登录（可以在其他页面使用）
function checkLoggedIn() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
}

// 获取当前用户信息
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// 退出登录
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('username'); // 同时移除单独存储的用户名
    
    // 跳转到登录页面
    window.location.href = 'login.html';
}
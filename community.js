// community.js
document.addEventListener('DOMContentLoaded', function() {
    // 获取用户名并显示
    const username = localStorage.getItem('username') || '用户';
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    // 检查用户是否已登录
    const loginButton = document.querySelector('a[href="login.html"]');
    if (loginButton) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            loginButton.style.display = 'none'; // 隐藏登录按钮
        }
    }

    // 用户菜单切换
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');

    userMenuButton.addEventListener('click', function() {
        userMenu.classList.toggle('hidden');
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', function(e) {
        if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // 帖子表单提交
    const postForm = document.getElementById('postForm');
    const postContent = document.getElementById('postContent');
    const postsContainer = document.getElementById('postsContainer');

    // 从本地存储获取帖子数据或初始化
    let posts = JSON.parse(localStorage.getItem('posts')) || [];

    // 渲染所有帖子
    renderPosts();

    postForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 检查用户是否已登录
        if (!checkLoggedIn()) {
            showErrorToast('请先登录后再发表帖子');
            return;
        }

        const content = postContent.value.trim();
        if (!content) {
            showErrorToast('请输入帖子内容');
            return;
        }

        // 创建新帖子
        const newPost = {
            id: Date.now(),
            author: username,
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: [],
            liked: false
        };

        // 添加到帖子数组
        posts.unshift(newPost);

        // 保存到本地存储
        localStorage.setItem('posts', JSON.stringify(posts));

        // 重新渲染帖子
        renderPosts();

        // 清空输入框
        postContent.value = '';

        // 显示成功提示
        showSuccessToast('帖子发布成功！');
    });

    // 渲染所有帖子
    function renderPosts() {
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow-card p-6 text-center text-neutral-500">
                    还没有帖子，快来发表第一个观点吧！
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    // 创建单个帖子元素
    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'bg-white rounded-lg shadow-card overflow-hidden';
        postElement.dataset.id = post.id;

        // 格式化时间
        const formattedTime = formatTime(post.timestamp);

        // 创建HTML结构
        postElement.innerHTML = `
            <div class="p-6">
                <!-- 帖子头部 -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-neutral-700">${post.author}</h3>
                            <p class="text-xs text-neutral-400">${formattedTime}</p>
                        </div>
                    </div>
                    <button class="text-neutral-400 hover:text-neutral-600">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>

                <!-- 帖子内容 -->
                <div class="mb-4 text-neutral-700">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>

                <!-- 帖子操作 -->
                <div class="flex items-center justify-between border-t border-neutral-100 pt-4">
                    <div class="flex space-x-4">
                        <button class="like-button flex items-center space-x-1 text-neutral-500 hover:text-primary" data-id="${post.id}">
                            <i class="fa-solid fa-heart ${post.liked ? 'text-red-500' : ''}"></i>
                            <span>${post.likes}</span>
                        </button>
                        <button class="comment-button flex items-center space-x-1 text-neutral-500 hover:text-primary" data-id="${post.id}">
                            <i class="fa-solid fa-comment"></i>
                            <span>${post.comments.length}</span>
                        </button>
                    </div>
                    <button class="share-button text-neutral-500 hover:text-primary">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>

            <!-- 评论区域 -->
            <div class="comments-container bg-neutral-50 px-6 py-4 border-t border-neutral-100 ${post.comments.length > 0 ? '' : 'hidden'}" data-post-id="${post.id}">
                <!-- 评论列表 -->
                <div class="comments-list space-y-4 mb-4">
                    ${post.comments.map(comment => `
                        <div class="comment-box pl-6">
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-medium text-sm text-neutral-700">${comment.author}</span>
                                        <span class="text-xs text-neutral-400">${formatTime(comment.timestamp)}</span>
                                    </div>
                                    ${comment.author === username ? `
                                    <button class="delete-comment-button text-red-500 hover:text-red-700 text-sm" data-post-id="${post.id}" data-comment-id="${comment.id}">
                                        <i class="fa-solid fa-trash"></i> 删除
                                    </button>
                                    ` : ''}
                                </div>
                                <p class="text-sm text-neutral-600">${comment.content.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- 添加评论 -->
                <div class="add-comment flex items-start space-x-3">
                    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-user text-xs"></i>
                    </div>
                    <div class="flex-grow">
                        <textarea class="comment-input w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:form-input-focus transition-all-300 text-sm" placeholder="写下您的评论..." data-post-id="${post.id}"></textarea>
                        <button class="submit-comment mt-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium py-1 px-3 rounded-lg transition-all-300" data-post-id="${post.id}">
                            评论
                        </button>
                    </div>
                </div>
            </div>
        `;

        return postElement;
    }

    // 格式化时间
    function formatTime(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postTime) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}秒前`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}分钟前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}小时前`;
        } else {
            return postTime.toLocaleDateString('zh-CN');
        }
    }

     // 事件委托处理点赞、评论等操作
        postsContainer.addEventListener('click', function(e) {
            // 点赞按钮
            if (e.target.closest('.like-button')) {
                const button = e.target.closest('.like-button');
                const postId = parseInt(button.dataset.id);
                toggleLike(postId);
            }
    
            // 评论按钮
            if (e.target.closest('.comment-button')) {
                const button = e.target.closest('.comment-button');
                const postId = parseInt(button.dataset.id);
                if (!checkLoggedIn()) {
                    showErrorToast('请先登录后再评论');
                    return;
                }
                toggleComments(postId);
            }
    
            // 提交评论按钮
            if (e.target.closest('.submit-comment')) {
                const button = e.target.closest('.submit-comment');
                const postId = parseInt(button.dataset.postId);
                if (!checkLoggedIn()) {
                    showErrorToast('请先登录后再评论');
                    return;
                }
                const textarea = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
                addComment(postId, textarea.value.trim());
                textarea.value = '';
            }
    
            // 删除评论按钮
            if (e.target.closest('.delete-comment-button')) {
                const button = e.target.closest('.delete-comment-button');
                const postId = parseInt(button.dataset.postId);
                const commentId = parseInt(button.dataset.commentId);
                console.log("Delete button clicked", postId, commentId); // 调试信息
                if (!checkLoggedIn()) {
                    showErrorToast('请先登录后再删除评论');
                    return;
                }
                if (confirm('确定要删除这条评论吗？')) {
                    deleteComment(postId, commentId);
                }
            }
        });
    
        // 删除评论
        function deleteComment(postId, commentId) {
            console.log("Deleting comment", postId, commentId); // 调试信息
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex === -1) return;
    
            const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return;
    
            // 删除评论
            posts[postIndex].comments.splice(commentIndex, 1);
    
            // 更新本地存储
            localStorage.setItem('posts', JSON.stringify(posts));
    
            // 重新渲染帖子
            renderPosts();
    
            // 显示成功提示
            showSuccessToast('评论删除成功！');
        }
           // 显示成功提示
           function showSuccessToast(message) {
               const toast = document.getElementById('successToast');
               const messageElement = document.getElementById('successMessage');
       
               messageElement.textContent = message;
               toast.classList.remove('translate-y-20', 'opacity-0');
       
               setTimeout(() => {
                   toast.classList.add('translate-y-20', 'opacity-0');
               }, 3000);
           }
       
           // 显示错误提示
           function showErrorToast(message) {
               const toast = document.getElementById('errorToast');
               const messageElement = document.getElementById('errorMessage');
       
               messageElement.textContent = message;
               toast.classList.remove('translate-y-20', 'opacity-0');
       
               setTimeout(() => {
                   toast.classList.add('translate-y-20', 'opacity-0');
               }, 3000);
           }
       
           // 检查用户是否已登录
           function checkLoggedIn() {
               const token = localStorage.getItem('auth_token');
               const user = localStorage.getItem('user');
               return !!(token && user);
           }
       
           // 绑定退出登录按钮
           const logoutButton = document.querySelector('#userMenu a[href="login.html"]');
           if (logoutButton) {
               logoutButton.addEventListener('click', function(e) {
                   e.preventDefault();
                   logout();
               });
           }
       
           // 退出登录
           function logout() {
               localStorage.removeItem('auth_token');
               localStorage.removeItem('user');
               localStorage.removeItem('username');
               window.location.href = 'login.html';
           }
       });
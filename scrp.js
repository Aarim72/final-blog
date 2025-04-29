// User authentication state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Get users from localStorage or initialize empty array
let users = JSON.parse(localStorage.getItem('users')) || [];

// Sample blog posts data
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [
    {
        id: 1,
        title: "My First Day in the City",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
        content: "Today was my first day exploring the city. The architecture was amazing and the people were so friendly...",
        author: "pankaj tripathi",
        date: "2024-03-15"
    },
    {
        id: 2,
        title: "Cooking Adventures",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        content: "Tried making pasta from scratch today. It was a messy but fun experience...",
        author: "Amit sharma",
        date: "2024-03-14"
    }
];

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Save blog posts to localStorage
function saveBlogPosts() {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}

// Save user to localStorage
function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Display error message
function showError(message, formId) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    const form = document.getElementById(formId);
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Display success message
function showSuccess(message, formId) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    const form = document.getElementById(formId);
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    form.insertBefore(successDiv, form.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    // Password must be at least 6 characters long
    return password.length >= 6;
}

// Convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Delete a blog post
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogPosts = blogPosts.filter(post => post.id !== postId);
        saveBlogPosts();
        displayBlogPosts();
        displayPostsList();
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation();
    window.location.href = 'index.html';
}

// Update navigation based on auth state
function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    if (currentUser) {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="create.html">Create Post</a>
            <div class="user-profile">
                <span>Welcome, ${currentUser.name}</span>
                <button onclick="logout()" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
            <a href="signup.html">Sign Up</a>
        `;
    }
}

// Check if user is logged in
function checkAuth() {
    if (!currentUser) {
        // If on create page and not logged in, redirect to login
        if (window.location.pathname.includes('create.html')) {
            window.location.href = 'login.html';
            return false;
        }
    }
    return true;
}

// Display posts list on create page
function displayPostsList() {
    const postsList = document.getElementById('postsList');
    if (!postsList) return;

    // Filter posts by current user if logged in
    const userPosts = currentUser 
        ? blogPosts.filter(post => post.author === currentUser.name)
        : blogPosts;

    postsList.innerHTML = userPosts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <div class="post-title">${post.title}</div>
                <div class="post-date">${new Date(post.date).toLocaleDateString()}</div>
            </div>
            <button class="delete-btn" onclick="deletePost(${post.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const createPostForm = document.getElementById('createPostForm');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Mobile Navigation
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Display Blog Posts
function displayBlogPosts() {
    if (!blogGrid) return;

    blogGrid.innerHTML = blogPosts.map(post => `
        <div class="blog-card">
            <img src="${post.image}" alt="${post.title}" class="blog-image">
            <div class="blog-content">
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.content.substring(0, 100)}...</p>
                <div class="blog-meta">
                    <span>By ${post.author}</span>
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                </div>
                ${currentUser && post.author === currentUser.name ? `
                    <button class="delete-btn" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Hash password function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Handle Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate email format
        if (!validateEmail(email)) {
            showError('Please enter a valid email address', 'loginForm');
            return;
        }
        
        // Validate password
        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long', 'loginForm');
            return;
        }
        
        // Hash password before comparison
        const hashedPassword = await hashPassword(password);
        
        // Find user in the users array
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            currentUser = {
                name: user.name,
                email: user.email
            };
            saveUser(currentUser);
            showSuccess('Login successful! Welcome back, ' + user.name + '!', 'loginForm');
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError('Invalid email or password', 'loginForm');
        }
    });
}

// Handle Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate name
        if (name.length < 3) {
            showError('Name must be at least 3 characters long', 'signupForm');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            showError('Please enter a valid email address', 'signupForm');
            return;
        }

        // Check if email already exists
        if (users.some(user => user.email === email)) {
            showError('Email already registered. Please login instead.', 'signupForm');
            return;
        }

        // Validate password
        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long', 'signupForm');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match', 'signupForm');
            return;
        }

        // Hash password before storing
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: hashedPassword
        };

        // Add user to users array
        users.push(newUser);
        saveUsers();

        // Set as current user
        currentUser = {
            name: name,
            email: email
        };
        saveUser(currentUser);

        showSuccess('Account created successfully! Welcome, ' + name + '!', 'signupForm');
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

// Compress image function
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions to max 800px while maintaining aspect ratio
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.8 quality
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Handle Create Post
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const imageFile = document.getElementById('image').files[0];
        
        if (!title || !content) {
            showError('Please fill in all fields');
            return;
        }
        
        let imageBase64 = '';
        if (imageFile) {
            try {
                imageBase64 = await compressImage(imageFile);
            } catch (error) {
                showError('Error processing image');
                return;
            }
        }
        
        if (!currentUser) {
            showError('Please login to create a post', 'createPostForm');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return;
        }

        try {
            const newPost = {
                id: blogPosts.length + 1,
                title,
                image: imageBase64,
                content,
                author: currentUser.name,
                date: new Date().toISOString().split('T')[0]
            };

            blogPosts.unshift(newPost);
            saveBlogPosts();
            showSuccess('Post created successfully!', 'createPostForm');
            
            createPostForm.reset();
            displayPostsList();
        } catch (error) {
            console.error('Error processing image:', error);
            showError('Error processing image. Please try again.', 'createPostForm');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavigation();
    displayBlogPosts();
    displayPostsList();
});







// ... existing code ...

// Delete all posts by current user
function deleteAllUserPosts() {
    if (!currentUser) {
        showError('You must be logged in to delete posts', 'blogGrid');
        return;
    }

    if (confirm(`Are you sure you want to delete all posts by ${currentUser.name}? This action cannot be undone.`)) {
        blogPosts = blogPosts.filter(post => post.author !== currentUser.name);
        saveBlogPosts();
        displayBlogPosts();
        displayPostsList();
        showSuccess('All your posts have been deleted successfully!', 'blogGrid');
    }
}

// Update navigation based on auth state
function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    if (currentUser) {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="create.html">Create Post</a>
            <button onclick="deleteAllUserPosts()" class="delete-all-btn">
                <i class="fas fa-trash"></i> Delete All My Posts
            </button>
            <div class="user-profile">
                <span>Welcome, ${currentUser.name}</span>
                <button onclick="logout()" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
            <a href="signup.html">Sign Up</a>
        `;
    }
}

// ... existing code ...





































































// Device Detection and Responsive Features
class DeviceManager {
    constructor() {
        this.deviceType = this.detectDevice();
        this.orientation = this.detectOrientation();
        this.touchDevice = this.isTouchDevice();
        this.init();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) return 'android';
        if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
        if (/windows/.test(userAgent)) return 'windows';
        if (/mac/.test(userAgent)) return 'mac';
        return 'other';
    }

    detectOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    init() {
        this.addDeviceClass();
        this.setupResponsiveFeatures();
        this.setupTouchEvents();
        this.setupOrientationChange();
        this.setupPerformanceOptimizations();
    }

    addDeviceClass() {
        document.body.classList.add(`device-${this.deviceType}`);
        document.body.classList.add(`orientation-${this.orientation}`);
        if (this.touchDevice) document.body.classList.add('touch-device');
    }

    setupResponsiveFeatures() {
        // Responsive image loading
        this.setupResponsiveImages();
        
        // Responsive font sizes
        this.setupResponsiveTypography();
        
        // Responsive navigation
        this.setupResponsiveNavigation();
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-srcset]');
        images.forEach(img => {
            const srcset = img.getAttribute('data-srcset');
            if (srcset) {
                img.srcset = srcset;
                img.sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
            }
        });
    }

    setupResponsiveTypography() {
        const updateFontSizes = () => {
            const baseSize = Math.min(window.innerWidth / 100, 16);
            document.documentElement.style.fontSize = `${baseSize}px`;
        };
        
        updateFontSizes();
        window.addEventListener('resize', updateFontSizes);
    }

    setupResponsiveNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-links');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    setupTouchEvents() {
        if (this.touchDevice) {
            // Add touch-specific event listeners
            document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove, { passive: true });
            document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        }
    }

    handleTouchStart(e) {
        // Add touch feedback
        const target = e.target.closest('.touchable');
        if (target) {
            target.classList.add('touch-active');
        }
    }

    handleTouchMove(e) {
        // Handle touch movement
    }

    handleTouchEnd(e) {
        // Remove touch feedback
        const target = e.target.closest('.touchable');
        if (target) {
            target.classList.remove('touch-active');
        }
    }

    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            this.orientation = this.detectOrientation();
            document.body.classList.remove('orientation-landscape', 'orientation-portrait');
            document.body.classList.add(`orientation-${this.orientation}`);
        });
    }

    setupPerformanceOptimizations() {
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Debounce resize events
        this.setupResizeDebounce();
        
        // Optimize animations
        this.optimizeAnimations();
    }

    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    setupResizeDebounce() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Update responsive features on resize
        this.setupResponsiveTypography();
        this.updateLayout();
    }

    updateLayout() {
        // Update layout based on screen size
        const container = document.querySelector('.container');
        if (container) {
            if (window.innerWidth < 768) {
                container.classList.add('mobile-layout');
            } else {
                container.classList.remove('mobile-layout');
            }
        }
    }

    optimizeAnimations() {
        // Use requestAnimationFrame for smooth animations
        const elements = document.querySelectorAll('.animated');
        elements.forEach(element => {
            element.style.willChange = 'transform, opacity';
        });
    }
}

// Initialize device manager
document.addEventListener('DOMContentLoaded', () => {
    const deviceManager = new DeviceManager();
    
    // Add loading state
    document.body.classList.add('loading');
    
    // Remove loading state when everything is ready
    window.addEventListener('load', () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    });
});

// Add smooth scrolling for all devices
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle form submissions with device-specific optimizations
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Add loading state
        form.classList.add('submitting');
        
        try {
            // Handle form submission
            const formData = new FormData(form);
            
            // Add device information
            formData.append('device_type', new DeviceManager().deviceType);
            formData.append('orientation', new DeviceManager().orientation);
            
            // Submit form
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });
            
            if (response.ok) {
                form.classList.add('submitted');
                form.classList.remove('submitting');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            form.classList.remove('submitting');
            form.classList.add('error');
        }
    });
});

// Add touch-friendly hover effects
document.querySelectorAll('.hover-effect').forEach(element => {
    if (new DeviceManager().touchDevice) {
        element.addEventListener('touchstart', () => {
            element.classList.add('active');
        });
        
        element.addEventListener('touchend', () => {
            element.classList.remove('active');
        });
    }
});

// Optimize performance for mobile devices
if (new DeviceManager().deviceType === 'android' || new DeviceManager().deviceType === 'ios') {
    // Reduce animation complexity on mobile
    document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
    
    // Optimize touch scrolling
    document.body.style.overscrollBehavior = 'none';
    
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehaviorY = 'contain';
}

// Add device-specific features
switch (new DeviceManager().deviceType) {
    case 'ios':
        // iOS specific optimizations
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        break;
        
    case 'android':
        // Android specific optimizations
        document.documentElement.style.setProperty('--status-bar-height', '24px');
        break;
        
    case 'windows':
        // Windows specific optimizations
        document.documentElement.style.setProperty('--scrollbar-width', '12px');
        break;
}
















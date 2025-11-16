// 专属食物列表（包含你的具体选项）
const defaultFoods = [
    "今天奖励自己吃顿麦当劳吧",
    "大米先生",
    "醉面",
    "紫燕百味鸡",
    "猪脚饭",
    "重庆小面",
    "河南烩面",
    "烤盘饭",
    "匠心卤",
    "民族窗口",
    "智园小站",
    "水煮鱼",
    "麻辣烫",
    "五谷渔粉",
    "土豆泥",
    "自选菜",
    "大盘鸡面",
    "铁锅炖",
    "螺蛳粉",
    "吾里香",
    "东门小吃街",
    "越苑那个米线",
    "尝尝新的"
];

// 食物图标映射
const foodIcons = {
    '麦当劳': '🍔',
    '大米先生': '🍚',
    '醉面': '🍜',
    '紫燕百味鸡': '🐔',
    '猪脚饭': '🐷',
    '重庆小面': '🌶️',
    '河南烩面': '🍜',
    '烤盘饭': '🔥',
    '匠心卤': '🥘',
    '民族窗口': '🏮',
    '智园小站': '🍱',
    '水煮鱼': '🐟',
    '麻辣烫': '🍲',
    '五谷渔粉': '🐠',
    '土豆泥': '🥔',
    '自选菜': '🥬',
    '大盘鸡面': '🍗',
    '铁锅炖': '🥘',
    '螺蛳粉': '🍜',
    '吾里香': '🍛',
    "东门小吃街":'🤓☝️',
    '越苑那个米线': '🍜',
    '尝尝新的': '🎯'
};

class FoodChooser {
    constructor() {
        this.foods = this.loadFoods();
        this.recentChoices = this.loadRecentChoices();
        this.init();
        this.updateDisplay();
    }

    init() {
        // 绑定事件
        document.getElementById('choose-btn').addEventListener('click', () => this.chooseFood());
        document.getElementById('list-btn').addEventListener('click', () => this.showFoodList());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefault());

        // 模态框关闭事件
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('food-list-modal')) {
                this.closeModal();
            }
        });

        // 显示当前日期
        this.updateDateDisplay();
        this.updateRecentChoices();
    }

    loadFoods() {
        const saved = localStorage.getItem('customFoodList');
        return saved ? JSON.parse(saved) : [...defaultFoods];
    }

    loadRecentChoices() {
        const saved = localStorage.getItem('recentChoices');
        return saved ? JSON.parse(saved) : [];
    }

    saveFoods() {
        localStorage.setItem('customFoodList', JSON.stringify(this.foods));
    }

    saveRecentChoices() {
        localStorage.setItem('recentChoices', JSON.stringify(this.recentChoices));
    }

    // 检查是否是周末
    isWeekend() {
        const today = new Date();
        return today.getDay() === 0 || today.getDay() === 6;
    }

    // 获取麦当劳的概率权重
    getMcDonaldWeight() {
        const baseWeight = 1;
        const weekendBonus = this.isWeekend() ? 3 : 0;
        return baseWeight + weekendBonus;
    }

    getFoodIcon(foodName) {
        for (const [key, icon] of Object.entries(foodIcons)) {
            if (foodName.includes(key)) {
                return icon;
            }
        }
        return '🍽️';
    }

    chooseFood() {
        const resultElement = document.getElementById('food-text');
        const iconElement = document.getElementById('food-icon');
        const tagElement = document.getElementById('special-tag');

        resultElement.textContent = '选择中...';
        iconElement.textContent = '⏳';
        tagElement.textContent = '';
        resultElement.classList.remove('pop-animation');

        setTimeout(() => {
            const selectedFood = this.getRandomFood();
            const foodIcon = this.getFoodIcon(selectedFood);

            resultElement.textContent = selectedFood;
            iconElement.textContent = foodIcon;
            resultElement.classList.add('pop-animation');

            // 如果是麦当劳，显示特殊标签
            if (selectedFood.includes('麦当劳')) {
                tagElement.textContent = this.isWeekend() ? '🎉 周末奖励时间！' : '✨ 特别奖励！';
            }

            // 添加到最近选择
            this.addToRecentChoices(selectedFood, foodIcon);
            this.updateRecentChoices();
        }, 800);
    }

    getRandomFood() {
        const weightedFoods = this.foods.map(food => {
            if (food.includes('麦当劳')) {
                return { food, weight: this.getMcDonaldWeight() };
            }
            return { food, weight: 1 };
        });

        const totalWeight = weightedFoods.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of weightedFoods) {
            random -= item.weight;
            if (random <= 0) {
                return item.food;
            }
        }

        return this.foods[Math.floor(Math.random() * this.foods.length)];
    }

    addToRecentChoices(food, icon) {
        // 移除重复项
        this.recentChoices = this.recentChoices.filter(item => item.food !== food);

        // 添加到开头
        this.recentChoices.unshift({ food, icon, time: new Date().toLocaleTimeString() });

        // 只保留最近5个
        this.recentChoices = this.recentChoices.slice(0, 5);
        this.saveRecentChoices();
    }

    updateRecentChoices() {
        const recentList = document.getElementById('recent-list');

        if (this.recentChoices.length === 0) {
            recentList.innerHTML = '<div class="empty-state">暂无记录</div>';
            return;
        }

        recentList.innerHTML = this.recentChoices.map(item => `
            <div class="recent-item">
                <span class="food-emoji">${item.icon}</span>
                <span class="food-name">${item.food}</span>
                <span class="time" style="margin-left: auto; font-size: 0.8em; color: #999;">${item.time}</span>
            </div>
        `).join('');
    }

    updateDateDisplay() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        const dateString = now.toLocaleDateString('zh-CN', options);
        const isWeekend = this.isWeekend();

        document.getElementById('date-display').innerHTML =
            `${dateString} ${isWeekend ? '🎉周末' : '📅工作日'}`;
    }

    showFoodList() {
        const modal = document.getElementById('food-list-modal');
        document.getElementById('search-food').value = '';
        this.searchFoods('');
        modal.style.display = 'block';
    }


    resetToDefault() {
        if (confirm('确定要恢复默认食物列表吗？')) {
            this.foods = [...defaultFoods];
            this.saveFoods();
            this.showFoodList();
            this.showNotification('已恢复默认列表！');
        }
    }

    closeModal() {
        document.getElementById('food-list-modal').style.display = 'none';
    }

    showNotification(message) {
        // 可以替换为更美观的提示方式
        alert(message);
    }
}

// 初始化应用
const foodChooser = new FoodChooser();
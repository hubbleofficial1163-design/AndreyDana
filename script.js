// Скрипт для свадебного сайта
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');
    
    // Инициализация формы RSVP с отправкой в Google Sheets
    initRSVPForm();
});

// ========== БАЗОВЫЕ СТИЛИ АНИМАЦИЙ ==========
const coreStyles = document.createElement('style');
coreStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(coreStyles);

// ========== УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ==========
function showModal(title, message, isError = false) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const icon = isError ? '✕' : '✓';
    const iconColor = isError ? '#c62828' : '#2e7d32';
    const bgIconColor = isError ? '#ffebee' : '#e8f5e9';
    const borderColor = isError ? '#c62828' : '#2e7d32';

    modal.innerHTML = `
        <div style="
            background: #ffffff;
            border-radius: 16px;
            padding: 32px 40px;
            max-width: 380px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.3s ease;
            border-top: 3px solid ${borderColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        ">
            <div style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${bgIconColor};
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
            ">
                <div style="
                    font-size: 32px;
                    font-weight: 400;
                    color: ${iconColor};
                    line-height: 1;
                ">${icon}</div>
            </div>
            <h3 style="
                font-size: 24px;
                font-weight: 500;
                color: #1a1a1a;
                margin-bottom: 12px;
                letter-spacing: -0.3px;
            ">${title}</h3>
            <p style="
                font-size: 16px;
                color: #555555;
                margin-bottom: 28px;
                line-height: 1.5;
            ">${message}</p>
            <button onclick="this.closest('#customModal').remove()" style="
                background: #f5f5f5;
                color: #333333;
                border: none;
                padding: 12px 32px;
                border-radius: 40px;
                font-family: inherit;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='#f5f5f5'">
                Закрыть
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    if (!isError) {
        setTimeout(() => {
            if (modal.parentElement) modal.remove();
        }, 4000);
    }
}

// ========== МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ==========
function showLoadingModal() {
    const existingLoading = document.getElementById('loadingModal');
    if (existingLoading) existingLoading.remove();
    
    const loadingModal = document.createElement('div');
    loadingModal.id = 'loadingModal';
    loadingModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    loadingModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px 40px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        ">
            <div style="
                width: 50px;
                height: 50px;
                border: 3px solid #e0e0e0;
                border-top-color: #6a633a;
                border-radius: 50%;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="
                font-size: 15px;
                color: #666;
                margin: 0;
            ">Отправка ответа...</p>
        </div>
    `;
    document.body.appendChild(loadingModal);
    return loadingModal;
}

// ========== GOOGLE SHEETS ==========
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwzZLpHtoXFFwQfM2CMDRNHmfKT0JJK4bbvCfzZmsaX9w0jN3ILCqO_CMtdHzdESQ/exec'; // ЗАМЕНИТЕ НА ВАШ URL

// Инициализация формы RSVP
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Получаем данные
        const nameInput = document.getElementById('name');
        const attendanceRadio = document.querySelector('input[name="attendance"]:checked');
        const companionsTextarea = document.getElementById('companions');
        const allergyTextarea = document.getElementById('allergy');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const attendance = attendanceRadio ? attendanceRadio.value : null;
        const companions = companionsTextarea ? companionsTextarea.value.trim() : '';
        const allergy = allergyTextarea ? allergyTextarea.value.trim() : '';
        
        // Собираем выбранные алкогольные предпочтения
        const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
        const alcoholValues = Array.from(alcoholCheckboxes).map(cb => cb.value);
        
        // Валидация
        if (!name) {
            showModal('Ошибка', 'Пожалуйста, введите ваше имя и фамилию', true);
            nameInput.focus();
            return;
        }
        
        if (!attendance) {
            showModal('Ошибка', 'Пожалуйста, выберите вариант присутствия', true);
            return;
        }
        
        // Показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        const loadingModal = showLoadingModal();
        
        try {
            // Формируем данные для отправки
            const formDataToSend = new URLSearchParams();
            formDataToSend.append('name', name);
            formDataToSend.append('attendance', attendance);
            formDataToSend.append('companions', companions);
            formDataToSend.append('allergy', allergy);
            
            for (const alcohol of alcoholValues) {
                formDataToSend.append('alcohol', alcohol);
            }
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formDataToSend.toString()
            });
            
            const result = await response.json();
            
            loadingModal.remove();
            
            if (result.result === 'success') {
                if (attendance === 'yes') {
                    showModal(
                        'Спасибо, ' + name + '!',
                        'Мы будем ждать вас на нашей свадьбе 11 июля 2026 года! 🎉',
                        false
                    );
                } else {
                    showModal(
                        'Спасибо за ответ!',
                        'Очень жаль, что вы не сможете быть с нами в этот день.',
                        false
                    );
                }
                // Очищаем форму
                form.reset();
                // Сбрасываем чекбоксы
                document.querySelectorAll('input[name="alcohol"]').forEach(cb => cb.checked = false);
                // Сбрасываем радио-кнопки
                document.querySelectorAll('input[name="attendance"]').forEach(rb => rb.checked = false);
            } else {
                throw new Error(result.message || 'Ошибка отправки');
            }
        } catch (error) {
            loadingModal.remove();
            showModal(
                'Ошибка',
                error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.',
                true
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

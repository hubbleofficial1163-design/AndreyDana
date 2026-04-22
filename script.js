// Всё максимально просто - только базовая загрузка
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');
});


// Обработка отправки формы RSVP
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = new FormData(form);
            const alcoholPreferences = [];
            formData.getAll('alcohol').forEach(value => {
                alcoholPreferences.push(value);
            });
            
            const data = {
                name: formData.get('name'),
                companions: formData.get('companions'),
                alcohol: alcoholPreferences,
                allergy: formData.get('allergy')
            };
            
            console.log('Данные формы:', data);
            
            // Здесь можно добавить отправку на сервер
            alert('Спасибо! Ваш ответ сохранен.');
            form.reset();
        });
    }
});
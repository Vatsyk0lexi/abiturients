// -----------------------------------ЗМІННІ---------------------------------------------//
const requestUrl = 'https://abit-calc.herokuapp.com/api/'
const dataPrograms = document.getElementById('data-programs');
const dataRating = document.getElementById('data-rating');
const getPrograms = document.getElementById('get-programs')
const detailsInfoBtn = document.getElementsByClassName('details-info');
const listOfProgram = document.getElementById('education-programs');
const formRating = document.forms.formScoreCount;
const ratingBtn = document.getElementById('CountScore');
const formSearch = document.forms.formSearch;
const SubjectFromSearchForm = formSearch.sertificate;
const SubjectFromRatingForm = formRating.sertificate;
const dataRatingPrograms = document.querySelector('.body-rating');

//"сховище" даних
const state = {
    EducationalPrograms:[],
    selectedСertificates:{
        nameCert1: '',
        priorityCert1: 1,
        nameCert2: '',
        priorityCert2: 2,
        nameCert3: '',
        priorityCert3: 3 
    },
    programsSearchedForForm:[],
    programsSearchedForCountRating:[],
    programForDetail:{
        id: ''
    },
    programsWithDetails:[],
}
// -------------------------------------- -----------------------------------------//

//---------------------------- Прокуртка при кліку меню ---------------\\

const menuLinks = document.querySelectorAll('.menu__link[data-goto]');

if(menuLinks.length){
    menuLinks.forEach(menuLink =>{
        menuLink.addEventListener('click', onMenuLinkClick)
    });

    function onMenuLinkClick(e){
        const menuLink = e.target;
        let menuBody = document.querySelector('.header__menu')
        if(menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) // Чи  існує клас куда скролитимемо
        {
            let classToScroll =document.querySelector(menuLink.dataset.goto)
            // Вираховуємо його положення на сторінці
            let classToScrollValue = classToScroll.getBoundingClientRect().top + scrollY - document.querySelector('header').offsetHeight;
            
            window.scrollTo({
                top: classToScrollValue,
                behavior: "smooth"
            });
            menuBody.classList.remove('_active');
            menuIcon.classList.remove('_active')
            document.body.classList.remove('_locked')
            e.preventDefault();
        }
    }
}

//- --------------------------------------------------------------------------//


//- ---------------------------------------Бургер меню------------------------------//

let menuIcon = document.querySelector('.menu__icon')
if(menuIcon){
    let menuBody = document.querySelector('.header__menu');
    menuIcon.addEventListener('click', () =>{
        menuIcon.classList.toggle('_active');
        menuBody.classList.toggle('_active');
        document.body.classList.toggle('_locked');
        
    })
}


//- --------------------------------------------------------------------------//


// --------------------------------------    ПОДІЇ   ---------------------------------------------//
window.addEventListener('unhandledrejection', function(event) {
    // объект события имеет два специальных свойства:
    alert(event.promise); // [object Promise] - промис, который сгенерировал ошибку
    alert(event.reason); // Error: Ошибка! - объект ошибки, которая не была обработана
});

window.addEventListener('load',async() => {
    clearEducationalPrograms();
    await getRequest();
    fillEduProgOption(state.EducationalPrograms)
    await CreateTableWithPrograms()
});

getPrograms.addEventListener('click', CreateTableWithPrograms);
async function CreateTableWithPrograms() { 
    clearEducationalPrograms();
    await getRequest();
    fillData(state.EducationalPrograms,1)
}


formSearch.addEventListener('submit',async(e)=>{
    e.preventDefault();
    clearSearchedPrograms();
    savingSelectedCertificates(formSearch);
    let firstRequest = await postRequest(1);
    let secondRequest = await extraSearch(1);
    if(firstRequest||secondRequest){
        
        fillData(state.programsSearchedForForm,0); //! ТУТ
    }else if(firstRequest == false && secondRequest == false){
        alert("Нічого не знайдено")
    }
})

formRating.addEventListener('submit',formSend);

// -----------------------------------------------------------------------------------//


async function getDetails(index, identifier) {
    clearDetailsPrograms();
    if(identifier == 1){ // якщо отримані дані із GET-запроса
        state.EducationalPrograms.sort((a,b) =>a.domain.name.localeCompare(b.domain.name))
        console.log(state.EducationalPrograms[index])
        let currentProgramId = state.EducationalPrograms[index]._id;  //***! ПОФІКСИТИ ЩОБ ПРАЦЮВАЛО ЯК ДЛЯ ЗНАЙДЕНИХ ПРОГ ТАК І ДЛЯ ЗАГРУЖЕНИХ ВІДРАЗУ */
        state.programForDetail.id =currentProgramId;
        let reques= await getInfoRequest(state.programForDetail.id)
        let identifier;
        if(reques){
            identifier = true;
        }else{
            identifier= false;
        }
        console.log(identifier);
        FillDataProgramDetail(index,identifier);
    }
    else if(identifier==0){// якщо отримані дані із POST-запроса
        console.log(state.programsSearchedForForm)
        state.programsSearchedForForm.sort((a,b) =>a.domain.name.localeCompare(b.domain.name))
        console.log(state.programsSearchedForForm[index])
        let currentProgramId = state.programsSearchedForForm[index]._id;  //***! ПОФІКСИТИ ЩОБ ПРАЦЮВАЛО ЯК ДЛЯ ЗНАЙДЕНИХ ПРОГ ТАК І ДЛЯ ЗАГРУЖЕНИХ ВІДРАЗУ */
        state.programForDetail.id =currentProgramId;
        let reques= await getInfoRequest(state.programForDetail.id)
        let identifier = false;
        if(reques){
            identifier = true;
        }
        FillDataProgramDetail(index,identifier);
    }

}

function CreateDataProgramDetail(data, index, identifier){
    if(identifier){
            let arrSubjects = data[0].subjects.split(";")
        let subject= arrSubjects.join(",  ")
        if(data[0].contacts.phone==''){
            data[0].contacts.phone = "Немає"
        }
        if(data[0].contacts.email == ''){
            data[0].contacts.email = "Немає"
        }
        if(window.matchMedia("(max-width: 900px)").matches){
        return `
                <td data-label="Кафедра" class="kafedra">${data[0].kathedra.name}</td>
                <td data-label="Контакти" class="contacts">Номер телефону:<span style = "font-weight: bold; font-size: 17px"> ${data[0].contacts.phone}</span><br> email: <span style = "font-weight: bold; font-size: 17px"> ${data[0].contacts.email}</span></td>
                <td data-label="Опис" class="description">${data[0].desc}</td>
                <td data-label="Предмети" class="subjects" >${subject}</td>
                <td data-label="Додаткова інформація" class="info"><a href=${data[0].profile} target="_blank">Додаткова інформація</a></td>
                <td data-label="Очистити" class="kafedra"><button class = "button" onclick="removeDetails(${index})">Очистити</button></td>
                `
        }else{
            return `
            <td data-label="Кафедра" class="kafedra">${data[0].kathedra.name}<br><br><button class = "button" onclick="removeDetails(${index})">Очистити</button></td>
            <td data-label="Контакти" class="contacts">Номер телефону:<span style = "font-weight: bold; font-size: 17px"> ${data[0].contacts.phone}</span><br> email: <span style = "font-weight: bold; font-size: 17px"> ${data[0].contacts.email}</span></td>
            <td data-label="Опис" class="description">${data[0].desc}</td>
            <td data-label="Предмети" class="subjects" >${subject}</td>
            <td data-label="Додаткова інформація" class="info"><a href=${data[0].profile} target="_blank">Додаткова інформація</a></td>
            `
        }
    }
    else if(identifier==false){

        if(window.matchMedia("(max-width: 900px)").matches)
        {
            return `
            <td data-label="Data not Found" class="kafedra">НІЧОГО НЕ ЗНАЙДЕНО!</td>
            <td data-label="Очистити" class="kafedra"><button class = "button" onclick="removeDetails(${index})">Очистити</button></td>
            `
        }else{
        return `
        <td data-label="Data not Found" class="kafedra"><button class = "button" onclick="removeDetails(${index})">Очистити</button></td>
        <td data-label="Data not Found" class="kafedra">НІЧОГО НЕ ЗНАЙДЕНО!</td>
        <td data-label="Data not Found" class="kafedra">НІЧОГО НЕ ЗНАЙДЕНО!</td>
        <td data-label="Data not Found" class="kafedra">НІЧОГО НЕ ЗНАЙДЕНО!</td>
        <td data-label="Очистити" class="kafedra">НІЧОГО НЕ ЗНАЙДЕНО!</td>
        `}
    }



}

function removeDetails(index){
    let rows = document.querySelectorAll('.row');
    rows[index].innerHTML = '';
    let theads = document.querySelectorAll('.details');
    theads[index].style.display = 'none';

}

function FillDataProgramDetail(index, identifier) {
    let rows = document.querySelectorAll('.row');
    console.log(rows[index]);
    let theads = document.querySelectorAll('.details');
    console.log(theads[index]);
    theads[index].style.display="";
    rows[index].innerHTML="";
    rows[index].innerHTML += CreateDataProgramDetail(state.programsWithDetails, index, identifier);
    


}

const createTemplate = (result,index,identity) => {
    let certificates = result.certificates.map(item=>item.name)
    let certificate = certificates.join(', ')
    return `
            <tr>
                <td data-label="Галузь знань" class="galuz">${result.domain.name}</td>
                <td data-label="Спеціальність" class="speciality"> ${result.speciality.name}</td>
                <td data-label="Програма" class="program" >${result.program.name}</td>
                <td data-label="Предмети ЗНО" class="zno-subjects" >${certificate}</td>
                <td data-label="Детальна інформація"><button class="button" onclick="getDetails(${index}, ${identity})">Детальніше</button></td>
            </tr>
            <tr class="details" style= "display: none;">
                <th>Кафедра</th>
                <th>Контакти</th>
                <th class = "desc">Опис</th>
                <th class = "subj">Предмети</th>
                <th>Посилання</th>
            </tr>
            <tr class="row ${index}"></tr>
    `
}


    const fillData = (data, identity) =>{
        dataPrograms.innerHTML = '';
        if(data.length){
            data.sort((a,b) =>a.domain.name.localeCompare(b.domain.name))
            data.forEach((data,index) => dataPrograms.innerHTML += createTemplate(data,index,identity));
        }
}

const savingSelectedCertificates= (form) => {
    let selectedCertificate1 =  form.sertificate[0].options.selectedIndex;
    let selectedCertificate2 =  form.sertificate[1].options.selectedIndex;
    let selectedCertificate3 =  form.sertificate[2].options.selectedIndex;

    let selectedCertificate1Value = form.sertificate[0].options[selectedCertificate1].value;
    let selectedCertificate2Value = form.sertificate[1].options[selectedCertificate2].value;
    let selectedCertificate3Value = form.sertificate[2].options[selectedCertificate3].value;

    state.selectedСertificates.nameCert1=selectedCertificate1Value;
    state.selectedСertificates.nameCert2=selectedCertificate2Value;
    state.selectedСertificates.nameCert3=selectedCertificate3Value;

    
}

const clearEducationalPrograms=()=>{
    state.EducationalPrograms.splice(0,state.EducationalPrograms.length);
}

const clearSelectedCertificates=()=>{
    state.selectedСertificates.nameCert1 = '';
    state.selectedСertificates.nameCert2 = '';
    state.selectedСertificates.nameCert3 = '';
}

const clearSearchedPrograms=()=>{
    state.programsSearchedForForm.splice(0,state.programsSearchedForForm.length);
}

const clearSearchedProgramsForRating=()=>{
    state.programsSearchedForCountRating.splice(0,state.programsSearchedForCountRating.length);
}

function clearDetailsPrograms() {
    state.programsWithDetails.splice(0,state.programsWithDetails.length);
}

const extraSearch = async(identifier) =>{  
    state.selectedСertificates.nameCert1="Українська мова"
    if(identifier == 1){
        return await postRequest(1);
    }else if(identifier == 0){
        return await postRequest(0);
    }
}


async function formSend(e){
    e.preventDefault();
    clearEducationalPrograms();
    await getRequest();

    let error = formValidate(formRating);
    if(error === 0){
        let selectedIndex = formRating.educationPrograms.options.selectedIndex;
        let selectedOption = formRating.educationPrograms.options[selectedIndex].value;
        if(selectedOption == "За обраними предметами"){
            await AllSearchedProgramsToCountRating()   
            formRating.reset();
        }else{    
            PrintResultRating()
            formRating.reset(); 
        }    
    }else{
        console.log('Виникла помилка при заповненні даних')
    }
}


function formValidate(form) {
    let error = 0;
    let copyEdu = state.EducationalPrograms.slice();
    copyEdu.sort((a,b) =>a.program.name.localeCompare(b.program.name));
    let inputScore = document.querySelectorAll('.rating'); // поля для заповнення оцінки
    let selectedIndex = formRating.educationPrograms.options.selectedIndex;
    let selectedOption = formRating.educationPrograms.options[selectedIndex].value;
    console.log("Selected Option value:", selectedOption)
    if(selectedOption == "За обраними предметами"){
        for (let index = 0; index < inputScore.length; index++) {
            const input = inputScore[index];
            formRemoveError(input);
            
            if(parseInt(input.value)>200||parseInt(input.value)<100){
                formAddError(input);
                error++;
            }
            else{
                if(input.value ===''){
                    formAddError(input);
                    error++;
                }
            }
        }
    }
    else{
        let selectedEducationProgram = copyEdu[formRating.educationPrograms.options[selectedIndex].value];// Вибрана освітня програма
        clearSelectedCertificates();
        savingSelectedCertificates(form);
    
        for (let index = 0; index < inputScore.length; index++) {
            const input = inputScore[index];
            formRemoveError(input);
            
            if(parseInt(input.value)>200||parseInt(input.value)<selectedEducationProgram.additions.minPoint){
                formAddError(input);
                error++;
            }
            else{
                if(input.value ===''){
                    formAddError(input);
                    error++;
                }
            }
        }
        let unSearchedSubject = 0;
        selectedEducationProgram.certificates.forEach((item, index) =>{
            if(index == 0){ // ! перевірка першого предмету
                formRemoveError(SubjectFromRatingForm[0]);
                //провіримо чи сертифікат назив "Укр мова" чи "Укр мова та література"
                if(item.name == "Українська мова"){
                    state.selectedСertificates.nameCert1 = "Українська мова"
                }
                if((item.name == state.selectedСertificates.nameCert1)==false ){
                    error++;
                    formAddError(SubjectFromRatingForm[0]);
                }
            }
            else if(index == 1){ // ! перевірка другого предмету
                formRemoveError(SubjectFromRatingForm[1]);
                if((item.name == state.selectedСertificates.nameCert2) ==false ){
                    error++;
                    formAddError(SubjectFromRatingForm[1]);
                }
            }
            else { // ! перевірка третього предмету
                if((item.name == state.selectedСertificates.nameCert3) == false ){
                    formRemoveError(SubjectFromRatingForm[2]);
                    unSearchedSubject++;
                    // Перевіряємо чи це не творчий конкурс, де його не повинно бути
                    if(state.selectedСertificates.nameCert3 == "Творчий конкурс" || item.name == "Творчий конкурс"){
                        error++;
                        formAddError(SubjectFromRatingForm[2]);
                    }
                }
                // Перевірка на мінімальне значення оцінки Творчого конкурсу
                else{
                    if(item.name == "Творчий конкурс"){
                    formRemoveError(inputScore[2]);
                        if(parseInt(inputScore[2].value)<selectedEducationProgram.certificates[2].minPoint){
                            formAddError(inputScore[2]);
                            error++;
                        }
                    }
                }
                // Перевіряємо чи користувач не продублював той же предмет два рази
                    if(state.selectedСertificates.nameCert3 == state.selectedСertificates.nameCert1 || state.selectedСertificates.nameCert3 == state.selectedСertificates.nameCert2)
                    {
                        error++;
                        formAddError(SubjectFromRatingForm[2]);
                    }
                }    
        })
        formRemoveError(SubjectFromRatingForm[2]);
        if((unSearchedSubject == selectedEducationProgram.certificates.length-3)==false){
            error ++;
            formAddError(SubjectFromRatingForm[2]);
        }
    }
    return error;
}

function formAddError(input){
    input.parentElement.classList.add('_error');
    input.classList.add('_error')
}

function formRemoveError(input){
    input.parentElement.classList.remove('_error');
    input.classList.remove('_error')
}


async function AllSearchedProgramsToCountRating(){
    let table = document.querySelector('.table-rating');
    if(table.style.display = "none"){
        table.style.display = "table";
    }
    clearSearchedProgramsForRating();
    clearSelectedCertificates();
    savingSelectedCertificates(formRating);
    await postRequest(0);
    await extraSearch(0);
    console.log(state.programsSearchedForCountRating)
    fillRating(state.programsSearchedForCountRating);
}

function fillRating(data){
    dataRatingPrograms.innerHTML = '';
    data.sort((a,b) =>a.speciality.name.localeCompare(b.speciality.name))
    data.forEach(data => {
            let rating =  countRating(data);
            dataRatingPrograms.innerHTML += createRating(data,rating);
        })
}

function createRating(selectedEducationProgram, rating){
        if(selectedEducationProgram.additions.hasOwnProperty('lastPoint')){
            let lastYearResult = selectedEducationProgram.additions.lastPoint;
            if( lastYearResult == null){
                lastYearResult = "Немає даних"
            }else{
                lastYearResult = selectedEducationProgram.additions.lastPoint.toFixed(1)
            }
        return `
        <tr >
            <td data-label = "Ваш конкурсний бал" class="user-rating">${rating}</td>
            <td data-label = "Спеціальність" class="speciality">${selectedEducationProgram.speciality.name}</td>
            <td data-label = "Програма" class="program" >${selectedEducationProgram.program.name}</td>
            <td data-label = "Прохідний конкурсний бал того року" class="last-year-result">${lastYearResult}</td>
        </tr> 
        `
    }else{
        return `
        <tr >
            <td data-label = "Ваш конкурсний бал" class="user-rating">${rating}</td>
            <td data-label = "Спеціальність"  class="speciality">${selectedEducationProgram.speciality.name}</td>
            <td data-label = "Програма"class="program" >${selectedEducationProgram.program.name}</td>
            <td  data-label = "Прохідний конкурсний бал того року" class="last-year-result">Немає даних</td>
        </tr> 
        `
    }

};


async function SelectedProgramToCountRating(dataCopy){

    let selectedIndex = formRating.educationPrograms.options.selectedIndex;
    let selectedEducationProgram = dataCopy[formRating.educationPrograms.options[selectedIndex].value];
    console.log("Обрана ОП:",selectedEducationProgram);
    let rating =  countRating(selectedEducationProgram)
    console.log('Конкурсний бал:',rating);
    if(selectedEducationProgram.additions.hasOwnProperty('lastPoint')){
        let lastYearResult = selectedEducationProgram.additions.lastPoint;
    if( lastYearResult == null){
        lastYearResult = "Немає даних"
    }else{
        lastYearResult = selectedEducationProgram.additions.lastPoint.toFixed(1)
    }
    return `
    <tr >
        <td data-label = "Ваш конкурсний бал" class="user-rating">${rating}</td>
        <td data-label = "Спеціальність" class="speciality">${selectedEducationProgram.speciality.name}</td>
        <td data-label = "Програма" class="program" >${selectedEducationProgram.program.name}</td>
        <td data-label = "Прохідний конкурсний бал того року" class="last-year-result">${lastYearResult}</td>
    </tr> 
    `
    } else{
        return `
        <tr >
            <td data-label = "Ваш конкурсний бал" class="user-rating">${rating}</td>
            <td data-label = "Спеціальність" class="speciality">${selectedEducationProgram.speciality.name}</td>
            <td data-label = "Програма" class="program" >${selectedEducationProgram.program.name}</td>
            <td data-label = "Прохідний конкурсний бал того року" class="last-year-result">Немає даних</td>
        </tr> 
        `
    }
}

async function PrintResultRating(){
    let table = document.querySelector('.table-rating');
    if(table.style.display = "none"){
        table.style.display = "table";
    }
    let copyEdu = state.EducationalPrograms.slice();
    copyEdu.sort((a,b) =>a.program.name.localeCompare(b.program.name));
    dataRatingPrograms.innerHTML = '';
    dataRatingPrograms.innerHTML +=  await SelectedProgramToCountRating(copyEdu);
}


function countRating(educationProgram){
    let rating = (formRating.rating[0].value*educationProgram.certificates[0].coef +formRating.rating[1].value*educationProgram.certificates[1].coef +formRating.rating[2].value*educationProgram.certificates[2].coef +formRating.rating[3].value *educationProgram.attestation.coef)*1.02;
    if(educationProgram.additions.support){
        rating = rating* 1.02
    }
    if(formRating.checkbox.checked){
        if(educationProgram.additions.support){
            rating = rating* 1.05;
        }else{
            rating = rating*1.02;
        }
    }
    console.log('Освітня програма:'+educationProgram.program.name+'\nБал 1:  '+formRating.rating[0].value+'  коф1: '+educationProgram.certificates[0].coef+'Бал 2:  '+formRating.rating[1].value+'  коф2: '+educationProgram.certificates[1].coef+'Бал 3:  '+formRating.rating[2].value+'  коф3: '+educationProgram.certificates[2].coef+'Бал атестату:  '+formRating.rating[3].value+'  кофAtest: '+educationProgram.attestation.coef +'\n Загальна оцінка: '+rating);
    return parseFloat(rating.toFixed(1))
}


const createEduProg = (educationProgram,index) => {
    return `
            <option value="${index}" name="educationPrograms">${educationProgram.program.name}</option>
    `
}

const fillEduProgOption = (data) =>{
    if(data.length){
        data.sort((a,b) =>a.program.name.localeCompare(b.program.name))
        data.forEach((data,index) => listOfProgram.innerHTML += createEduProg(data,index));
    }
}


//--------------------------------------ЗАПИТИ НА СЕРВЕР---------------------------------------------// 

async function getRequest(){
    try {
        const response = await fetch(requestUrl + 'prog/');
        const items = await response.json();
        return state.EducationalPrograms = state.EducationalPrograms.concat(items);
    } catch (err) {
        return alert(err);
    }
}


async function postRequest(identifier){
    try {
        const response = await fetch(requestUrl + 'search/', {
            method: "POST",
            body: JSON.stringify(state.selectedСertificates),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if(response.ok){
            const items = await response.json();
            // ! ТУТ
            if(identifier==1){
                state.programsSearchedForForm = state.programsSearchedForForm.concat(items) 
            }else if(identifier==0){
                state.programsSearchedForCountRating = state.programsSearchedForCountRating.concat(items)
            }
        }
        else{
            console.log("Проблеми із сервером, дані не будуть додані до сховища!")
        }
        if(response.status == 404){
            console.log("Status 404 NOT FOUND")
            return false;
        }else{
            return true;
        }
        
    } catch (error) {
        return alert(error);
    }
                
}

async function getInfoRequest(id){
    try {
        const response = await fetch(requestUrl + 'stat/' + id);
        if(response.ok){
            const items = await response.json();
            return state.programsWithDetails = state.programsWithDetails.concat(items);
            
        }
        else{
            console.log("Проблеми із сервером, дані не будуть додані до сховища!")
        }
        if(response.status == 404){
            console.log("Status 404 NOT FOUND")
            return false;
        }else{
            return true;
        }
    } catch (err) {
        return alert(err);
    }
}
//-----------------------------------------------------------------------------------// 
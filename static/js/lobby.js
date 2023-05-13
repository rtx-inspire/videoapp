let form = document.getElementById('form')

console.log("HI");
let handleSubmit = async (e) => {
    e.preventDefault()
    window.open('/room', '_self')
}

form.addEventListener('submit', handleSubmit)
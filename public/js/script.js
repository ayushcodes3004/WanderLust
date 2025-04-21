(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
    const commentTextarea = document.querySelector('#comment');
    const invalidFeedback = commentTextarea?.nextElementSibling;


  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

// Rating display and validation
const ratings = document.querySelectorAll('input[type="range"][name="review[rating]"]')
ratings.forEach(rating => {
    const valueDisplay = rating.parentElement.querySelector('#ratingValue')
    if (rating && valueDisplay) {
        // Update rating value display
        rating.addEventListener('input', () => {
            valueDisplay.textContent = rating.value
        })
    }
})

// Comment validation
const comments = document.querySelectorAll('textarea[name="review[comment]"]')
comments.forEach(comment => {
    comment.addEventListener('input', () => {
        const length = comment.value.length
        const minLength = 5
        const maxLength = 500

        if (length < minLength) {
            comment.setCustomValidity(`Please add ${minLength - length} more characters`)
        } else if (length > maxLength) {
            comment.setCustomValidity(`Please remove ${length - maxLength} characters`)
        } else {
            comment.setCustomValidity('')
        }
        comment.reportValidity()
    })
})
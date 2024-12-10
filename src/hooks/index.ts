function useToast(errors, toast, type = 'error') {
Object.keys(errors).forEach((item) => {
    if (errors[item]) toast[type]?.(errors[item])
})
return {
    isToast: true
}
}

export {
    useToast
}
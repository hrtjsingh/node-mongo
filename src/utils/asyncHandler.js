const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                next(err)
            })
    }
}

// const asyncHandler1 = (requestHandler) => async (req, res, next) => {
//     try {
//         return await requestHandler(req, res, next)
//     } catch (error) {
//         return res.status(err.code || 500).json({
//             success: false,
//             message: err.message || "something went wrong"
//         })
//     }
// }


export { asyncHandler }
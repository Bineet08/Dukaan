let navigateRef = null;

export const setGlobalNavigate = (navigate) => {
    navigateRef = navigate;
};

export const globalNavigate = (path, options) => {
    if (navigateRef) {
        navigateRef(path, options);
    } else {
        window.location.href = path; // Fallback
    }
};

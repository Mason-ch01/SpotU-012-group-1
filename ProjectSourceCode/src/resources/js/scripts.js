function toggleNav() {
    var sideNav = document.getElementById("sideNav");
    var mainContent = document.getElementById("mainContent");

    // Toggle the 'open' class on both sidebar and main content
    sideNav.classList.toggle("open");
    mainContent.classList.toggle("open");
}

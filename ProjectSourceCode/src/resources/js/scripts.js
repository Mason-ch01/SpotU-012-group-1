
function toggleNav() {
    var sideNav = document.getElementById("sideNav");
    var mainContent = document.getElementById("mainContent");

    // Toggle the 'open' class on both sidebar and main content
    sideNav.classList.toggle("open");
    mainContent.classList.toggle("open");
}

let pfp = 'default.png';  

function updateProfilePhoto() {
    pfp = document.getElementById('image').value;
}


async function saveProfilePhoto(pfp) {
    const username = document.getElementById('username').innerHTML; 

    try {
        const response = await fetch(`/profile/${username}/updatepfp`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                profile_photo: pfp
            })
        });

    } catch (error) {
        console.error('Error with updating pfp', error);
        
    }
}




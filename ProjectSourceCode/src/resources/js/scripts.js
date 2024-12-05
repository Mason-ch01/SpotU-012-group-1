
function toggleNav() {
    var sideNav = document.getElementById("sideNav");
    var mainContent = document.getElementById("mainContent");

    // Toggle the 'open' class on both sidebar and main content
    sideNav.classList.toggle("open");
    mainContent.classList.toggle("open");
}

function new_post(songName, artists) {
    console.log('Song Name:', songName);
    console.log('Artists:', artists);

    // You can further process these values, such as creating a new post or displaying them
    // For example:
    alert('Creating a post for "' + songName + '" by ' + artists);
}

let pfp = 'default.png';

async function saveProfilePhotoBtn() {
    const newProfilePhoto = document.getElementById('image').value; // Get selected photo

    try {
        const response = await fetch('/update-profile-photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newProfilePhoto }),
        });

        const data = await response.json();

        if (data.success) {
            // Update the profile image on the page
            document.querySelector('.profile-img').src = `../../../resources/profilePhotos/${data.profile_photo}`;
            alert('Profile photo updated successfully!');
        } else {
            alert('Error updating profile photo');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the profile photo.');
    }
}

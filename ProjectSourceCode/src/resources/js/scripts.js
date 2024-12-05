
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

// document.getElementById('follow').addEventListener('click', async function () {
//     const button = this;
//     const isFollowing = button.getAttribute('data-is-following') === 'true';
//     const username = document.getElementById('username').innerHTML; // Assumes profile username is displayed here

//     try {
//         const response = await fetch(`/profile/${username}/follow`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 isFollowing: !isFollowing, // Toggle the current state
//             }),
//         });

//         if (response.ok) {
//             // Toggle the button text and data attribute based on the new state
//             button.setAttribute('data-is-following', !isFollowing);
//             button.innerText = !isFollowing ? 'Unfollow' : 'Follow';
//         } else {
//             alert('Failed to update follow state.');
//         }
//     } catch (error) {
//         console.error('Error toggling follow state:', error);
//         alert('An error occurred while trying to follow/unfollow.');
//     }
// });








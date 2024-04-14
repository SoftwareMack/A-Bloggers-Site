import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, query, where, getDocs, getDoc, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getDownloadURL, getStorage, ref } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOJqTI8NvimpjQW98ea58LBVRFNsDVJts",
    authDomain: "myblog-68151.firebaseapp.com",
    projectId: "myblog-68151",
    storageBucket: "myblog-68151.appspot.com",
    messagingSenderId: "255791256338",
    appId: "1:255791256338:web:5e9f4372c5c214142a59cb",
    measurementId: "G-N514TFF6LR",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
var storage = getStorage()
var currentUser;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace('../../index.html')
    }
    else {
        const btn = document.getElementById('publish');
        btn.addEventListener('click', async () => {
            var title = document.getElementById("title").value
            var desc = document.getElementById("description").value
            if (title.length >= 5 && title.length <= 50 && desc.length >= 100 && desc.length <= 3000) {
                try {
                    const docRef = await addDoc(collection(db, "blogs"), {
                        timeOfPost: serverTimestamp(),
                        title,
                        description: desc,
                        email: user.email,
                        name: currentUser
                    });
                    Swal.fire({
                        text: 'Post Added Successful',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        location.reload()
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
            else {
                Swal.fire({
                    text: 'Post Title should be b/w 5 to 50 character and description should be b/w 100 to 3000 characters',
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
            }
        });
        async function getYourName() {
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach(async (doc) => {
                if (doc.id == user.uid) {
                    console.log(doc.data());
                    currentUser = doc.data().fname;

                    const q = query(collection(db, "blogs"), where("email", "==", user.email));
                    const querySnapshot = await getDocs(q);

                    var container = document.getElementById("container");

                    if (querySnapshot.size === 0) {
                        container.innerHTML += `
                            <div class="container" style="width: 100%; padding: 0; margin: 0">
                                <div class="container-fluid" style="width: 100%; padding: 0; margin: 0">
                                    <div class="row" style="width: 100%; padding: 0; margin: 0">
                                        <div class="col-md-12 border border-1 bg-body rounded">
                                            <div class="blog p-3">
                                                <div class="profile d-flex">
                                                    <div class="userbox ms-4">
                                                        <h3 id="blog-title" style="font-size: 18px">No posts yet</h3>
                                                        <p class="fw-bold text-muted">${(doc.data().name) || "User"} - August 16th, 2023</p>
                                                    </div>
                                                </div>
                                                <br>
                                                <div class="description">
                                                    <p class="text-muted">Start sharing your thoughts!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                            </div>
                        `;
                    } else {
                        querySnapshot.forEach((doc) => {
                            getDownloadURL(ref(storage, doc.data().email))
                                .then((url) => {
                                    document.getElementById("container").innerHTML += `<div class="container" style="width: 100%; padding: 0; margin: 0">
                          <div class="container-fluid" style="width: 100%; padding: 0; margin: 0">
                              <div class="row" style="width: 100%; padding: 0; margin: 0">
                                  <div class="col-md-12 border border-1 bg-body rounded">
                                      <div class="blog p-3">
                                          <div class="profile d-flex align-items-center" style="border-bottom: 1px solid #eee; padding-bottom: 10px">
                                              <div class="imgbox  cursor">
                                                  <img src="${(url) || 'https://i.pinimg.com/originals/7d/34/d9/7d34d9d53640af5cfd2614c57dfa7f13.png'}"
                                                      height="90px" width="90px" style="object-fit: cover; border-radius: 50%" onclick="location.replace('../profile/profile.html')">
                                              </div>
                                              <div class="userbox ms-3">
                                                  <h3 id="blog-title" style="font-size: 22px; margin-bottom: 3px">${doc.data().title}</h3>
                                                  <p class="text-muted" style="margin:0; color: #aaa; font-weight: lighter">${(doc.data().name) || "User"} - ${doc.data().timeOfPost ? moment(doc.data().timeOfPost.toDate()).fromNow() : moment().fromNow()}</p>
                                              </div>
                                          </div>
                                          <br>
                                          <div class="description">
                                              <p class="text-muted" style="word-break: break-all">${doc.data().description}</p>
                                          </div>
                                          <div style="display: flex; align-items: center; gap: 20px">
                                          <a onclick="edit('${doc.id}')" style="color: #7749F8; cursor: pointer">Edit</a>
                                          <a onclick="del('${doc.id}')" style="color: skyblue; cursor: pointer">Delete</a>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <br>
                          </div>
                          <br>
                        </div>`
                                })
                            console.log(doc.data().timeOfPost);
                        });
                    }
                }
            });
            document.getElementById("username").innerHTML = currentUser;
        }

        getYourName()
        console.log(currentUser);
    }
});
const logout = document.getElementById('lO')
logout.addEventListener('click', () => {
    Swal.fire({
        title: 'Are you sure you want to LogOut?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1ca1f1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Logout!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            signOut(auth).then(() => {
                Swal.fire(
                    'Logout!',
                    'User has successfully logged out.',
                    'success'
                ).then(() => {
                    location.replace("../index.html")
                })
            }).catch((error) => {
            });
        }
    })
})


async function del(toDel) {
    Swal.fire({
        title: 'Are you sure you want to Delete',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1ca1f1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "blogs", toDel)).then(() => {
                location.reload()
            })
        }
    }).catch((error) => {
    });
}
window.del = del

async function edit(id) {
    const blogRef = doc(db, "blogs", id);

    const currentBlog = await getDoc(blogRef);

    Swal.fire({
        title: 'Edit Blog',
        html: `
            <input id="editedTitle" class="swal2-input" value="${currentBlog.data().title}" placeholder="Blog Title" required>
            <textarea id="editedDescription" class="swal2-input az" placeholder="Blog Description" required style="width: 58%; border: 1px solid #dee2e6; border-radius: 5px; height: 150px; outline: none; -webkit-scrollbar-width:0">${currentBlog.data().description}</textarea>
        `,
        confirmButtonText: 'Save',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const editedTitle = Swal.getPopup().querySelector('#editedTitle').value;
            const editedDescription = Swal.getPopup().querySelector('#editedDescription').value;
            return { editedTitle, editedDescription };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { editedTitle, editedDescription } = result.value;
            await updateDoc(blogRef, {
                title: editedTitle,
                description: editedDescription
            });

            Swal.fire({
                title: 'Blog Updated',
                icon: 'success'
            }).then(() => {
                location.reload();
            });
        }
    });
}

window.edit = edit;


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace("../../index.html")
    }
})

function ct(ta) {
    document.getElementById('wc').innerHTML = ta.value.length;
    if (ta.value.length < 100) {
        document.getElementById("wc").style.color = "red";
    } else if (ta.value.length >= 100 && ta.value.length < 1000) {
        document.getElementById("wc").style.color = "#ffd68a";
    } else if (ta.value.length >= 1000) {
        document.getElementById("wc").style.color = "limegreen";
    }
}

window.ct = ct

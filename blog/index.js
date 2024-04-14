import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getDownloadURL, getStorage, ref } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import moment from "https://cdn.skypack.dev/moment";

const firebaseConfig = {
    apiKey: "AIzaSyCOJqTI8NvimpjQW98ea58LBVRFNsDVJts",
    authDomain: "myblog-68151.firebaseapp.com",
    projectId: "myblog-68151",
    storageBucket: "myblog-68151.appspot.com",
    messagingSenderId: "255791256338",
    appId: "1:255791256338:web:5e9f4372c5c214142a59cb",
    measurementId: "G-N514TFF6LR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
var storage = getStorage()

const querySnapshot = await getDocs(collection(db, "blogs"));
querySnapshot.forEach(async (doc) => {
    const url = await getDownloadURL(ref(storage, doc.data().email));
    document.getElementById("container").innerHTML += `
        <div class="container" style="width: 100%; padding: 0; margin: 0">
            <div class="container-fluid" style="width: 100%; padding: 0; margin: 0">
                <div class="row" style="width: 100%; padding: 0; margin: 0">
                    <div class="col-md-12 border border-1 bg-body rounded">
                        <div class="blog p-3">
                            <div class="profile d-flex align-items-center" style="border-bottom: 1px solid #eee; padding-bottom: 10px; align-items: center">
                                <div class="imgbox">
                                    <img src="${url || "https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png"}" class="cursor"
                                        height="90px" width="90px" style="object-fit: cover;  border-radius: 50%;" onclick="goTo('${doc.data().email}','${url}')">
                                </div>
                                <div class="userbox ms-3 ps-3" style="border-left: 1px solid #eee;">
                                    <h3 id="blog-title" style="font-size: 22px; margin-bottom: 3px; word-break: break-all">${doc.data().title}</h3>
                                    <p class="text-muted" style="margin:0; color: #aaa; font-weight: lighter">${(doc.data().name) || "User"} - ${doc.data().timeOfPost ? moment(doc.data().timeOfPost.toDate()).fromNow() : moment().fromNow()}</p>
                                </div>
                            </div>
                            <br>
                            <div class="description">
                                <p class="text-muted" style="word-break: break-all">${doc.data().description}</p>
                            </div>
                            <div style="display:flex; border-top: 1px solid #f6f6f6; padding-top: 10px; align-items: center; justify-content: flex-end">
                                <i class="fa-solid fa-heart"
                                    id="heart-${doc.id}"
                                    onclick="addToLike('${doc.id}')"
                                    style="color: ${doc.data().likedBy && doc.data().likedBy.includes(auth.currentUser.uid) ? 'red' : '#7749F8'}; font-size: 18px; cursor: pointer">
                                </i>
                                <h4 id="likes-${doc.id}" style="font-size: 16px; font-weight: lighter; margin: 0; margin-left: 10px; color: #7749F8">${doc.data().likes || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
            </div>
            <br>
        </div>`;
    onSnapshot(doc.ref, (snapshot) => {
        try {
            const updatedData = snapshot.data();
            const likesElement = document.getElementById(`likes-${doc.id}`);
            if (likesElement) {
                likesElement.innerText = updatedData.likes || 0;
            }
            const heartIcon = document.getElementById(`heart-${doc.id}`);
            if (heartIcon) {
                heartIcon.style.color = updatedData.likedBy && updatedData.likedBy.includes(auth.currentUser.uid) ? '#ff0000' : 'skyblue';
            }
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    });
});

function goTo(id, url) {
    localStorage.setItem("id", id);
    localStorage.setItem("url", url);
    location.replace("../pages/seperate.html");
}
window.goTo = goTo;

const time = new Date().getHours();
let greeting;

if (time < 4) {
    greeting = "Good Night";
} else if (time < 10) {
    greeting = "Good Morning";
} else if (time < 14) {
    greeting = "Good Noon";
} else if (time < 18) {
    greeting = "Good Afternoon";
} else if (time < 20) {
    greeting = "Good Evening";
} else {
    greeting = "Good Night";
}

document.getElementById("greeting").innerHTML = `${greeting} Readers !`;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("l").innerHTML = 'Go To Dashboard';
        document.getElementById("l").href = "./pages/dashboard/dashboard.html";
    }
});

async function addToLike(id) {
    const postRef = doc(db, "blogs", id);
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();

    if (postData.likedBy && postData.likedBy.includes(auth.currentUser.uid)) {
        await updateDoc(postRef, {
            likes: Math.max((postData.likes || 0) - 1, 0),
            likedBy: postData.likedBy.filter(userId => userId !== auth.currentUser.uid)
        });
    } else {
        await updateDoc(postRef, {
            likes: (postData.likes || 0) + 1,
            likedBy: [...(postData.likedBy || []), auth.currentUser.uid]
        });
    }
}
window.addToLike = addToLike;

function hasLikedPost(postId) {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
    return likedPosts.includes(postId);
}

function updateLikedPosts(postId) {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
    if (hasLikedPost(postId)) {
        localStorage.setItem(
            "likedPosts",
            JSON.stringify(likedPosts.filter((id) => id !== postId))
        );
    } else {
        localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, postId]));
    }
}

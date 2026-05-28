
// =========================
// ELEMENT
// =========================

const imageInput =
document.getElementById("imageInput");

const previewImage =
document.getElementById("previewImage");

const previewCard =
document.getElementById("previewCard");

const resultCard =
document.getElementById("resultCard");

const resultLabel =
document.getElementById("resultLabel");

const confidenceText =
document.getElementById("confidenceText");

const confidenceFill =
document.getElementById("confidenceFill");

const diseaseDescription =
document.getElementById("diseaseDescription");

const diseaseCause =
document.getElementById("diseaseCause");

const diseaseSolution =
document.getElementById("diseaseSolution");

const diseaseSymptoms =
document.getElementById("diseaseSymptoms");

const diseasePrevention =
document.getElementById("diseasePrevention");

const diseaseDanger =
document.getElementById("diseaseDanger");

const diseaseTips =
document.getElementById("diseaseTips");

const fileName =
document.getElementById("fileName");

const loading =
document.getElementById("loading");

// =========================
// FILE PREVIEW
// =========================

imageInput.addEventListener(
    "change",
    () => {

        if(imageInput.files.length > 0){

            const file =
            imageInput.files[0];

            // VALIDASI IMAGE

            if(!file.type.startsWith("image/")){

               showNotification(
                    "File harus berupa gambar!",
                    "error"
            );

                imageInput.value = "";

                return;
            }

            // FILE NAME

            fileName.innerHTML =
            file.name;

            // PREVIEW IMAGE

            const imageURL =
            URL.createObjectURL(file);

            previewImage.src =
            imageURL;

            previewCard.style.display =
            "flex";

            // RESET RESULT

            resultCard.style.display =
            "none";

            confidenceFill.style.width =
            "0%";

        }

        else{

            fileName.innerHTML =
            "Belum ada file dipilih";

            previewCard.style.display =
            "none";

        }

    }
);

// =========================
// PREDICT IMAGE
// =========================

async function predictImage(){

    // VALIDASI FILE

    if(imageInput.files.length === 0){

        showNotification(
            "Silakan pilih gambar terlebih dahulu.",
            "error"
    );

        return;
    }

    const file =
    imageInput.files[0];

    // =========================
    // SHOW LOADING
    // =========================

    loading.style.display =
    "flex";

    // RESET RESULT

    resultCard.style.display =
    "none";

    confidenceFill.style.width =
    "0%";

    // =========================
    // FORM DATA
    // =========================

    const formData =
    new FormData();

    formData.append(
        "file",
        file
    );

    try{

        // =========================
        // FETCH API
        // =========================

        const response =
        await fetch(

            "/predict",

            {

                method:"POST",

                body:formData

            }

        );

        // =========================
        // VALIDASI RESPONSE
        // =========================

        if(!response.ok){

            throw new Error(
                "Backend response error"
            );

        }

        const data =
        await response.json();

        // =========================
        // HIDE LOADING
        // =========================

        loading.style.display =
        "none";

        // =========================
        // ERROR BACKEND
        // =========================

        if(data.error){

            showNotification(
                data.error,
                "error"
        );

            return;
        }

        // =========================
        // SHOW RESULT
        // =========================

        resultCard.style.display =
        "flex";

        showNotification(
            "Deteksi penyakit berhasil dilakukan!",
            "success"
        );

        // SMOOTH SCROLL

        resultCard.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

        /* =========================
        SAVE HISTORY
        ========================= */

        const detectionHistory =
        JSON.parse(
            localStorage.getItem(
                "riceDetectionHistory"
            )
        ) || [];

        const historyItem = {

            disease:
            data.prediction,

            confidence:
            parseFloat(data.confidence),

            image:
            previewImage.src || "", 

            date:
            new Date().toLocaleString(
                "id-ID"
            )

        };

        detectionHistory.unshift(
            historyItem
        );

        if(detectionHistory.length > 10){

            detectionHistory.pop();

        }

        localStorage.setItem(

            "riceDetectionHistory",

            JSON.stringify(
                detectionHistory
            )

        );

        renderHistory();

        // =========================
        // LABEL & CONFIDENCE
        // =========================

        const label =
        data.prediction;

        const confidence =
        parseFloat(
            data.confidence
        ).toFixed(2);

        // UPDATE UI

        resultLabel.innerHTML =
        label;

        confidenceText.innerHTML =
        `${confidence}%`;

        // =========================================
        // WARNA BERDASARKAN PENYAKIT
        // =========================================

        if(label === "Blast"){

            confidenceFill.style.background =
            "linear-gradient(90deg,#ef4444,#f87171)";

            resultLabel.style.color =
            "#dc2626";
        }

        else if(label === "Brown Spot"){

            confidenceFill.style.background =
            "linear-gradient(90deg,#f97316,#fb923c)";

            resultLabel.style.color =
            "#ea580c";
        }

        else if(label === "Bacterial Blight"){

            confidenceFill.style.background =
            "linear-gradient(90deg,#2563eb,#60a5fa)";

            resultLabel.style.color =
            "#2563eb";
        }

        else if(label === "Tungro"){

        confidenceFill.style.background =
        "linear-gradient(90deg,#eab308,#fde047)";

        resultLabel.style.color =
        "#ca8a04";
        }

        // =========================================
        // TIMESTAMP
        // =========================================

        const now = new Date();

        const formattedDate =
        now.toLocaleDateString(
            "id-ID",
            {
                day:"numeric",
                month:"long",
                year:"numeric"
            }
        );

        const formattedTime =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

        document.getElementById(
            "detectTime"
        ).innerHTML =

        `🕒 ${formattedDate} • ${formattedTime}`;

        // ANIMASI PROGRESS

        setTimeout(() => {

            confidenceFill.style.width =
            `${confidence}%`;

        }, 200);

        /* =========================
        PROBABILITY AI
        ========================= */

        const probabilityList =
        document.getElementById(
            "probabilityList"
        );

        probabilityList.innerHTML = "";

        
        

        if(data.all_predictions){

        Object.entries(
            data.all_predictions
        ).forEach(([name,value]) => {

            const probabilityHTML = `

            <div class="probability-item">

                <div class="probability-head">

                    <span class="probability-name">
                        ${name}
                    </span>

                    <span class="probability-percent">
                        ${value.toFixed(2)}%
                    </span>

                </div>

                <div class="probability-bar">

                    <div
                        class="probability-fill"
                        style="width:${value}%"
                    ></div>

                </div>

            </div>

            `;

            // MOBILE MODAL

            probabilityList.innerHTML +=
            probabilityHTML;

        });

    } 

        // =========================
        // BROWN SPOT
        // =========================

        if(label === "Brown Spot"){

            diseaseDescription.innerHTML =

            `Brown Spot adalah penyakit daun padi
            yang ditandai dengan bercak coklat
            berbentuk oval pada permukaan daun.
            Penyakit ini dapat menghambat
            pertumbuhan dan menurunkan
            hasil panen padi.`;

            diseaseCause.innerHTML =

            `Disebabkan oleh jamur
            Bipolaris oryzae
            yang berkembang pada kondisi
            lembab dan tanaman lemah.`;

            diseaseSolution.innerHTML =

            `Gunakan fungisida,
            lakukan pemupukan seimbang
            dan atur kelembaban sawah
            agar jamur tidak berkembang.`;

            diseaseSymptoms.innerHTML =

            `Muncul bercak kecil coklat
            pada daun yang lama-kelamaan
            membesar dan menyebabkan daun mengering.`;

            diseasePrevention.innerHTML =

            `Gunakan benih sehat,
            lakukan pemupukan seimbang
            dan hindari kelembaban berlebihan.`;

            diseaseDanger.innerHTML =

            `Tingkat bahaya sedang.
            Jika dibiarkan dapat
            menurunkan hasil panen.`;

            diseaseTips.innerHTML =

            `Pastikan tanaman mendapatkan
            nutrisi cukup agar tidak mudah terserang jamur.`;

        }

        // =========================
        // BLAST
        // =========================

        else if(label === "Blast"){

            diseaseDescription.innerHTML =

            `Blast merupakan penyakit serius
            pada tanaman padi yang menyerang
            daun hingga batang tanaman.`;

            diseaseCause.innerHTML =

            `Disebabkan oleh jamur
            Pyricularia oryzae
            yang berkembang cepat
            pada cuaca lembab.`;

            diseaseSolution.innerHTML =

            `Gunakan fungisida,
            pilih varietas tahan penyakit
            dan hindari pemupukan nitrogen
            berlebihan.`;

            diseaseSymptoms.innerHTML =

            `Gejala ditandai bercak
            berbentuk belah ketupat
            dengan bagian tengah abu-abu.`;

            diseasePrevention.innerHTML =

            `Gunakan varietas tahan blast,
            atur jarak tanam
            dan kurangi kelembaban sawah.`;

            diseaseDanger.innerHTML =

            `Tingkat bahaya tinggi.
            Penyakit blast dapat menyebabkan gagal panen.`;

            diseaseTips.innerHTML =

            `Lakukan pemeriksaan daun secara rutin
            terutama saat musim hujan.`;

        }

        // =========================
        // BACTERIAL BLIGHT
        // =========================

        else if(label === "Bacterial Blight"){

            diseaseDescription.innerHTML =

            `Bacterial Blight menyebabkan
            daun menguning,
            mengering,
            lalu mati dari ujung daun.`;

            diseaseCause.innerHTML =

            `Disebabkan oleh bakteri
            Xanthomonas oryzae
            yang menyebar melalui air
            dan percikan hujan.`;

            diseaseSolution.innerHTML =

            `Gunakan varietas tahan penyakit
            dan hindari genangan air
            berlebihan.`;

            diseaseSymptoms.innerHTML =

            `Daun tampak menguning
            dari ujung lalu mengering
            seperti terbakar.`;

            diseasePrevention.innerHTML =

            `Gunakan benih sehat
            dan jaga kebersihan area sawah.`;

            diseaseDanger.innerHTML =

            `Tingkat bahaya tinggi
            jika menyerang banyak tanaman.`;

            diseaseTips.innerHTML =

            `Kurangi penyebaran air
            dari tanaman sakit ke tanaman sehat.`;

        }

        // =========================
        // TUNGRO
        // =========================

        else if(label === "Tungro"){

            diseaseDescription.innerHTML =

            `Tungro menyebabkan daun
            menguning hingga jingga
            dan tanaman menjadi kerdil.`;

            diseaseCause.innerHTML =

            `Disebabkan oleh virus
            yang dibawa oleh wereng hijau.`;

            diseaseSolution.innerHTML =

            `Kendalikan wereng hijau
            menggunakan insektisida
            dan gunakan bibit sehat.`;

            diseaseSymptoms.innerHTML =

            `Daun menguning,
            tanaman tumbuh pendek
            dan jumlah anakan berkurang.`;

            diseasePrevention.innerHTML =

            `Lakukan pengendalian wereng
            dan gunakan varietas tahan virus.`;

            diseaseDanger.innerHTML =

            `Tingkat bahaya tinggi
            karena dapat menyebar cepat.`;

            diseaseTips.innerHTML =

            `Pantau populasi wereng hijau
            secara rutin di area sawah.`;

        }

        // =========================
        // HEALTHY
        // =========================

        else if(label === "Healthy"){

            diseaseDescription.innerHTML =

            `Daun padi terlihat sehat
            tanpa tanda penyakit serius.`;

            diseaseCause.innerHTML =

            `Tanaman berada dalam kondisi baik
            dan tidak ditemukan infeksi.`;

            diseaseSolution.innerHTML =

            `Pertahankan pola perawatan,
            pengairan dan pemupukan
            secara teratur.`;

            diseaseSymptoms.innerHTML =

            `Daun tampak hijau segar
            tanpa bercak atau perubahan warna.`;

            diseasePrevention.innerHTML =

            `Lakukan perawatan rutin
            dan pemantauan berkala tanaman.`;

            diseaseDanger.innerHTML =

            `Tidak ditemukan indikasi penyakit berbahaya.`;

            diseaseTips.innerHTML =

            `Pertahankan kondisi sawah
            agar tanaman tetap sehat dan produktif.`;

        }

        // =========================
        // DEFAULT
        // =========================

        else{

            diseaseDescription.innerHTML = "-";

            diseaseCause.innerHTML = "-";

            diseaseSolution.innerHTML = "-";

            diseaseSymptoms.innerHTML = "-";

            diseasePrevention.innerHTML = "-";

            diseaseDanger.innerHTML = "-";

            diseaseTips.innerHTML = "-";

        }

    }

    // =========================
    // ERROR
    // =========================

    catch(error){

        console.log(error);

        loading.style.display =
        "none";

        showNotification(
            "Terjadi kesalahan pada backend AI.",
            "error"
        );
    }

}

// =========================================
// MODERN NOTIFICATION
// =========================================

function showNotification(
    message,
    type = "info"
){

    const notification =
    document.getElementById(
        "notification"
    );

    notification.innerHTML =
    message;

    notification.className =
    `notification ${type}`;

    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 10);

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 3000);

}

const menuToggle = document.getElementById("menuToggle");

const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    navMenu.classList.toggle("active");

});

document.addEventListener("click", (e) => {

    if (
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
    ) {

        navMenu.classList.remove("active");

    }

});

function openProbabilityModal(){

    document.getElementById(
        "probabilityModal"
    ).style.display = "flex";

    document.body.style.overflow =
    "hidden";
}

function closeProbabilityModal(){

    document.getElementById(
        "probabilityModal"
    ).style.display = "none";

    document.body.style.overflow =
    "auto";
}

/* =========================
   RENDER HISTORY
========================= */

function renderHistory(){

    const historyContainer =
    document.getElementById(
        "historyContainer"
    );

    if(!historyContainer) return;

    const detectionHistory =
    JSON.parse(
        localStorage.getItem(
            "riceDetectionHistory"
        )
    ) || [];

    historyContainer.innerHTML = "";

    if(detectionHistory.length === 0){

        historyContainer.innerHTML = `

        <p class="empty-history">

            Belum ada riwayat deteksi.

        </p>

        `;

        return;

    }

    detectionHistory.forEach(item => {

        historyContainer.innerHTML += `

        <div class="history-card">

            <img
                src="${item.image || ''}"
                class="history-image"
                alt="History"
            >

            <div class="history-content">

                <h3 class="history-disease">

                    🌾 ${item.disease}

                </h3>

                <div class="history-confidence">

                    Akurasi AI:
                    ${item.confidence.toFixed(2)}%

                </div>

                <div class="history-date">

                    🕒 ${item.date}

                </div>

            </div>

        </div>

        `;

    });

}

/* =========================
   LOAD HISTORY
========================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        renderHistory();

        showSection(
            "berandaSection"
        );

    }

);

/* =========================
   HISTORY MODAL
========================= */

function openHistoryModal(){

    document.getElementById(
        "historyModal"
    ).style.display = "flex";

    document.body.style.overflow =
    "hidden";

}

function closeHistoryModal(){

    document.getElementById(
        "historyModal"
    ).style.display = "none";

    document.body.style.overflow =
    "auto";

}

window.addEventListener("click",(e)=>{

    const historyModal =
    document.getElementById(
        "historyModal"
    );

    const probabilityModal =
    document.getElementById(
        "probabilityModal"
    );

    if(e.target === historyModal){

        closeHistoryModal();

    }

    if(e.target === probabilityModal){

        closeProbabilityModal();

    }

});

/* =========================
   SHOW SECTION
========================= */

function showSection(sectionId){

    // ambil semua section
    const sections =
    document.querySelectorAll(
        ".main-section"
    );

    // hapus active dari semua section
    sections.forEach(section => {

        section.classList.remove(
            "active"
        );

    });

    // tampilkan section dipilih
    document.getElementById(
        sectionId
    ).classList.add(
        "active"
    );

    // scroll ke atas
    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

// =========================
// CNN MODAL
// =========================

const cnnModal =
document.getElementById(
    "cnnModal"
);

// buka modal
function openModal(){

    cnnModal.style.display = "flex";

    document.body.style.overflow = "hidden";

}

// tutup modal
function closeModal(){

    cnnModal.style.display = "none";

    document.body.style.overflow = "auto";

}

/* =========================
   TECH MODAL
========================= */

function openTechModal(id){

    document.getElementById(
        id
    ).style.display = "flex";

    document.body.style.overflow =
    "hidden";

}

function closeTechModal(id){

    document.getElementById(
        id
    ).style.display = "none";

    document.body.style.overflow =
    "auto";

}

/* =========================
   CLOSE TECH MODAL OUTSIDE
========================= */

window.addEventListener(
    "click",
    (e) => {

        const efficientnetModal =
        document.getElementById(
            "efficientnetModal"
        );

        const tensorflowModal =
        document.getElementById(
            "tensorflowModal"
        );

        const datasetModal =
        document.getElementById(
            "datasetModal"
        );

        if(e.target === cnnModal){

            closeModal();

        }

        if(e.target === efficientnetModal){

            closeTechModal(
                "efficientnetModal"
            );

        }

        if(e.target === tensorflowModal){

            closeTechModal(
                "tensorflowModal"
            );

        }

        if(e.target === datasetModal){

            closeTechModal(
                "datasetModal"
            );

        }

    }
);
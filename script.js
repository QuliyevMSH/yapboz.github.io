const puzzleContainer = document.getElementById("puzzleContainer");
const difficultySelect = document.getElementById("difficulty");
const startGameButton = document.getElementById("startGame");
const imageUpload = document.getElementById("imageUpload");
const gameMusic = document.getElementById("gameMusic");

let puzzleSize = 3;
let imageSrc = "https://source.unsplash.com/random/500x500";
let pieces = [];
let originalOrder = [];

// Mobil cihaz tespiti ve uyarı mesajını gösterme
if (/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("mobileWarning").style.display = "block";
} else {
  document.getElementById("mobileWarning").style.display = "none";
}

difficultySelect.addEventListener("change", (e) => {
  puzzleSize = parseInt(e.target.value);
});

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    imageSrc = URL.createObjectURL(file);
    startGameButton.style.display = "inline-block"; // Fotoğraf seçildiğinde butonu göster
  } else {
    startGameButton.style.display = "none"; // Fotoğraf seçilmezse butonu gizle
  }
});

startGameButton.addEventListener("click", () => {
  startGame();
});

const musicFiles = [
  "./audio/aglama-hadi-oyna.mp3",
  "./audio/mask.mp3"
];
let currentMusicIndex = 0;

const audio = new Audio(musicFiles[currentMusicIndex]);

audio.addEventListener("ended", () => {
  currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length; // Sonraki müziğe geç
  audio.src = musicFiles[currentMusicIndex]; // Yeni müziğin kaynağını ayarla
  audio.play(); // Yeni müziği çalmaya başla
});

function startGame() {
  puzzleContainer.innerHTML = "";
  puzzleContainer.style.gridTemplateRows = `repeat(${puzzleSize}, 1fr)`;
  puzzleContainer.style.gridTemplateColumns = `repeat(${puzzleSize}, 1fr)`;

  pieces = [];
  originalOrder = [];

  // Müzik çalmaya başla
  audio.src = musicFiles[currentMusicIndex]; // Başlangıç müziğini ayarla
  audio.play();

  for (let row = 0; row < puzzleSize; row++) {
    for (let col = 0; col < puzzleSize; col++) {
      const piece = document.createElement("div");
      piece.classList.add("puzzle-piece");
      piece.style.width = `${500 / puzzleSize}px`;
      piece.style.height = `${500 / puzzleSize}px`;

      piece.style.backgroundImage = `url(${imageSrc})`;
      piece.style.backgroundPosition = `${(col * -100) / (puzzleSize - 1)}% ${(row * -100) / (puzzleSize - 1)}%`;
      piece.style.backgroundSize = `${puzzleSize * 100}% ${puzzleSize * 100}%`;

      piece.draggable = true;
      piece.dataset.row = row;
      piece.dataset.col = col;
      
      puzzleContainer.appendChild(piece);
      pieces.push({ element: piece, row, col });
      originalOrder.push({ row, col });

      piece.addEventListener("dragstart", handleDragStart);
      piece.addEventListener("dragover", handleDragOver);
      piece.addEventListener("drop", handleDrop);
    }
  }

  shufflePieces();
}

function shufflePieces() {
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    puzzleContainer.appendChild(pieces[i].element);
    puzzleContainer.appendChild(pieces[j].element);
  }

  pieces.forEach((piece, index) => {
    piece.row = Math.floor(index / puzzleSize);
    piece.col = index % puzzleSize;
  });
}

let draggedPiece = null;

function handleDragStart(event) {
  draggedPiece = event.target;
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();

  const targetPiece = event.target;
  if (draggedPiece !== targetPiece) {
    const draggedRow = draggedPiece.dataset.row;
    const draggedCol = draggedPiece.dataset.col;
    const targetRow = targetPiece.dataset.row;
    const targetCol = targetPiece.dataset.col;

    [draggedPiece.dataset.row, targetPiece.dataset.row] = [targetRow, draggedRow];
    [draggedPiece.dataset.col, targetPiece.dataset.col] = [targetCol, draggedCol];

    puzzleContainer.insertBefore(draggedPiece, targetPiece);
    puzzleContainer.insertBefore(targetPiece, draggedPiece);

    checkWin();
  }
}

function checkWin() {
  let isSolved = true;

  Array.from(puzzleContainer.children).forEach((piece, index) => {
    const expectedRow = Math.floor(index / puzzleSize);
    const expectedCol = index % puzzleSize;
    const currentRow = parseInt(piece.dataset.row);
    const currentCol = parseInt(piece.dataset.col);

    if (currentRow !== expectedRow || currentCol !== expectedCol) {
      isSolved = false;
    }
  });

  if (isSolved) {
    setTimeout(() => alert("Tebrikler! Yapbozu tamamladınız."), 100);
  }
}

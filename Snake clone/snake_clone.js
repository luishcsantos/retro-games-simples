// --- CONFIGURAÇÃO INICIAL ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');

        // O jogo funciona em uma grade. 'box' é o tamanho de cada quadrado da grade.
        const box = 20;
        const LARGURA_EM_BOX = canvas.width / box;
        const ALTURA_EM_BOX = canvas.height / box;

        // --- VARIÁVEIS DO JOGO ---
        let snake = [];
        snake[0] = { x: 10 * box, y: 10 * box }; // Posição inicial da cobra

        let food = {
            x: Math.floor(Math.random() * LARGURA_EM_BOX) * box,
            y: Math.floor(Math.random() * ALTURA_EM_BOX) * box
        };
        
        let score = 0;
        let direction;
        let game;
        let isGameOver = false;

        // --- CONTROLES ---
        document.addEventListener('keydown', updateDirection);

        function updateDirection(event) {
            const keyPressed = event.keyCode;
            // Impede a cobra de inverter a direção sobre si mesma
            if (keyPressed == 37 && direction != 'RIGHT') { // Seta para esquerda
                direction = 'LEFT';
            } else if (keyPressed == 38 && direction != 'DOWN') { // Seta para cima
                direction = 'UP';
            } else if (keyPressed == 39 && direction != 'LEFT') { // Seta para direita
                direction = 'RIGHT';
            } else if (keyPressed == 40 && direction != 'UP') { // Seta para baixo
                direction = 'DOWN';
            }
        }

        // --- FUNÇÕES DE DESENHO ---
        function desenharFundo() {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // NOVO: Desenha o grid
            ctx.strokeStyle = '#333'; // Cor da linha do grid
            ctx.lineWidth = 0.5; // Espessura da linha

            for (let i = 0; i <= LARGURA_EM_BOX; i++) {
                ctx.beginPath();
                ctx.moveTo(i * box, 0);
                ctx.lineTo(i * box, canvas.height);
                ctx.stroke();
            }

            for (let i = 0; i <= ALTURA_EM_BOX; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * box);
                ctx.lineTo(canvas.width, i * box);
                ctx.stroke();
            }
        }

        function desenharCobra() {
            for (let i = 0; i < snake.length; i++) {
                ctx.fillStyle = (i === 0) ? '#00ff00' : '#00cc00'; // Cabeça de cor diferente
                ctx.fillRect(snake[i].x, snake[i].y, box, box);

                ctx.strokeStyle = '#000'; // Contorno para os segmentos
                ctx.strokeRect(snake[i].x, snake[i].y, box, box);
            }
        }

        function desenharComida() {
            ctx.fillStyle = 'red';
            ctx.fillRect(food.x, food.y, box, box);
        }
        
        // --- LÓGICA PRINCIPAL DO JOGO ---
        function loopPrincipal() {
            if (isGameOver) {
                mostrarTelaGameOver();
                return;
            }

            desenharFundo();
            desenharCobra();
            desenharComida();

            let snakeX = snake[0].x;
            let snakeY = snake[0].y;

            // Move a cobra na direção atual
            if (direction == 'LEFT') snakeX -= box;
            if (direction == 'RIGHT') snakeX += box;
            if (direction == 'UP') snakeY -= box;
            if (direction == 'DOWN') snakeY += box;

            // Lógica para comer a comida
            if (snakeX == food.x && snakeY == food.y) {
                score++;
                scoreElement.innerText = score;
                // Gera nova comida
                food = {
                    x: Math.floor(Math.random() * LARGURA_EM_BOX) * box,
                    y: Math.floor(Math.random() * ALTURA_EM_BOX) * box
                };
            } else {
                // Se não comeu, remove o último segmento da cauda
                snake.pop();
            }

            // Cria a nova cabeça da cobra
            let newHead = { x: snakeX, y: snakeY };

            // Checa colisões
            checarColisoes(newHead);

            // Adiciona a nova cabeça no início do corpo da cobra
            snake.unshift(newHead);
        }

        function checarColisoes(head) {
            // Colisão com as paredes
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                gameOver();
            }
            // Colisão com o próprio corpo
            for (let i = 1; i < snake.length; i++) {
                if (head.x == snake[i].x && head.y == snake[i].y) {
                    gameOver();
                }
            }
        }

        function gameOver() {
            clearInterval(game);
            isGameOver = true;
        }
        
        function mostrarTelaGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '40px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText('Clique para reiniciar', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        function resetarJogo() {
            snake = [{ x: 10 * box, y: 10 * box }];
            direction = undefined;
            score = 0;
            scoreElement.innerText = score;
            isGameOver = false;
            
            food = {
                x: Math.floor(Math.random() * LARGURA_EM_BOX) * box,
                y: Math.floor(Math.random() * ALTURA_EM_BOX) * box
            };
            
            game = setInterval(loopPrincipal, 100); // Controla a velocidade do jogo
        }

        // Event listener para reiniciar
        canvas.addEventListener('click', () => {
            if (isGameOver) {
                resetarJogo();
            }
        });
        
        // Inicia o jogo
        resetarJogo();
// --- CONFIGURAÇÃO INICIAL ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        const LARGURA = canvas.width;
        const ALTURA = canvas.height;

        // --- VARIÁVEIS DO JOGO ---
        let pontuacao = 0;
        let isGameOver = false;
        let playerBullet = null;
        let invaderBullets = [];
        let invaders = [];
        
        let invaderDirection = 1;
        let invaderSpeed = 0.5;
        let invaderDropDistance = 20;
        // AJUSTE: A probabilidade de tiro foi reduzida e a lógica de cálculo foi simplificada.
        let invaderFireRate = 0.02; // Probabilidade de um tiro ser disparado a cada frame.

        // --- JOGADOR (NAVE) ---
        const player = {
            x: LARGURA / 2 - 25,
            y: ALTURA - 60,
            largura: 50,
            altura: 20,
            velocidade: 5,
            cor: '#4caf50',

            desenhar: function() {
                ctx.fillStyle = this.cor;
                ctx.fillRect(this.x, this.y, this.largura, this.altura);
                // "Canhão" da nave
                ctx.fillRect(this.x + this.largura / 2 - 2.5, this.y - 10, 5, 10);
            },

            atualizar: function() {
                if (teclas.ArrowLeft && this.x > 0) {
                    this.x -= this.velocidade;
                }
                if (teclas.ArrowRight && this.x < LARGURA - this.largura) {
                    this.x += this.velocidade;
                }
            },
            
            atirar: function() {
                if (!playerBullet) { // Permite apenas um tiro por vez
                    playerBullet = {
                        x: this.x + this.largura / 2 - 2.5,
                        y: this.y - 10,
                        largura: 5,
                        altura: 15,
                        velocidade: 8,
                        cor: '#00ff00'
                    };
                }
            }
        };
        
        // --- INVASORES (ALIENS) ---
        function criarInvasores() {
            invaders = []; // Limpa a array antes de criar
            const linhas = 5;
            const colunas = 10;
            const invaderLargura = 30;
            const invaderAltura = 20;
            const espacoX = 15;
            const espacoY = 15;
            const offsetX = 40;
            const offsetY = 30;

            for (let i = 0; i < linhas; i++) {
                for (let j = 0; j < colunas; j++) {
                    invaders.push({
                        x: offsetX + j * (invaderLargura + espacoX),
                        y: offsetY + i * (invaderAltura + espacoY),
                        largura: invaderLargura,
                        altura: invaderAltura,
                        cor: `hsl(${i * 30}, 100%, 50%)` // Cores diferentes por linha
                    });
                }
            }
        }
        
        function atualizarInvasores() {
            let deveDescerEInverter = false;
            
            if (invaders.length === 0) return; // Evita erros se todos os invasores forem destruídos

            for (const invader of invaders) {
                invader.x += invaderSpeed * invaderDirection;
                if (invader.x <= 0 || invader.x + invader.largura >= LARGURA) {
                    deveDescerEInverter = true;
                }
                 // Game over se chegarem na base
                if (invader.y + invader.altura >= player.y) {
                    gameOver();
                }
            }

            if (deveDescerEInverter) {
                invaderDirection *= -1;
                for (const invader of invaders) {
                    invader.y += invaderDropDistance;
                }
            }
            
            // AJUSTE: A lógica de tiro agora é uma chance fixa por frame,
            // não mais multiplicada pelo número de invasores.
            if (Math.random() < invaderFireRate) {
                let atirador = invaders[Math.floor(Math.random() * invaders.length)];
                invaderBullets.push({
                    x: atirador.x + atirador.largura / 2 - 2.5,
                    y: atirador.y + atirador.altura,
                    largura: 5,
                    altura: 10,
                    velocidade: 5,
                    cor: '#ff0000'
                });
            }
        }
        
        function desenharInvasores() {
            for (const invader of invaders) {
                ctx.fillStyle = invader.cor;
                ctx.fillRect(invader.x, invader.y, invader.largura, invader.altura);
            }
        }
        
        // --- TIROS ---
        function atualizarTiros() {
            // Tiro do jogador
            if (playerBullet) {
                playerBullet.y -= playerBullet.velocidade;
                if (playerBullet.y < 0) {
                    playerBullet = null; // Remove o tiro se sair da tela
                }
            }
            
            // Tiros dos invasores
            for (let i = invaderBullets.length - 1; i >= 0; i--) {
                let bullet = invaderBullets[i];
                bullet.y += bullet.velocidade;
                if (bullet.y > ALTURA) {
                    invaderBullets.splice(i, 1); // Remove o tiro
                }
            }
        }

        function desenharTiros() {
            // Tiro do jogador
            if (playerBullet) {
                ctx.fillStyle = playerBullet.cor;
                ctx.fillRect(playerBullet.x, playerBullet.y, playerBullet.largura, playerBullet.altura);
            }

            // Tiros dos invasores
            for (const bullet of invaderBullets) {
                ctx.fillStyle = bullet.cor;
                ctx.fillRect(bullet.x, bullet.y, bullet.largura, bullet.altura);
            }
        }

        // --- CONTROLES ---
        const teclas = {
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false
        };

        window.addEventListener('keydown', (e) => {
            if (teclas[e.key] !== undefined) {
                teclas[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (teclas[e.key] !== undefined) {
                teclas[e.key] = false;
            }
        });
        
        function processarInput(){
            if (teclas[' ']) {
                player.atirar();
            }
        }
        
        // --- DETECÇÃO DE COLISÃO ---
        function checarColisoes() {
            // Colisão: tiro do jogador vs invasor
            if (playerBullet) {
                for (let i = invaders.length - 1; i >= 0; i--) {
                    const invader = invaders[i];
                    if (
                        playerBullet.x < invader.x + invader.largura &&
                        playerBullet.x + playerBullet.largura > invader.x &&
                        playerBullet.y < invader.y + invader.altura &&
                        playerBullet.y + playerBullet.altura > invader.y
                    ) {
                        invaders.splice(i, 1); // Remove o invasor
                        playerBullet = null; // Remove o tiro
                        pontuacao += 100;
                        invaderSpeed *= 1.02; // Aumenta a velocidade
                        break; // Sai do loop para evitar colisões múltiplas
                    }
                }
            }
            
            // Colisão: tiro do invasor vs jogador
            for (let i = invaderBullets.length - 1; i >= 0; i--) {
                const bullet = invaderBullets[i];
                if (
                    bullet.x < player.x + player.largura &&
                    bullet.x + bullet.largura > player.x &&
                    bullet.y < player.y + player.altura &&
                    bullet.y + bullet.altura > player.y
                ) {
                    invaderBullets.splice(i, 1);
                    gameOver();
                    break;
                }
            }
        }
        
        // --- UI (Interface do Usuário) ---
        function desenharUI() {
            ctx.fillStyle = 'white';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(`PONTUAÇÃO: ${pontuacao}`, 20, 25);
        }
        
        function mostrarTelaGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, LARGURA, ALTURA);
            
            ctx.fillStyle = 'red';
            ctx.font = '50px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', LARGURA / 2, ALTURA / 2 - 30);

            ctx.fillStyle = 'white';
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText(`Pontuação Final: ${pontuacao}`, LARGURA / 2, ALTURA / 2 + 30);
            
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText('Clique para reiniciar', LARGURA / 2, ALTURA / 2 + 80);
        }
        
        // --- LÓGICA DO JOGO ---
        function resetarJogo() {
            pontuacao = 0;
            invaderSpeed = 0.5;
            player.x = LARGURA / 2 - 25;
            playerBullet = null;
            invaderBullets = [];
            criarInvasores();
            isGameOver = false;
            loopPrincipal();
        }

        function gameOver() {
            isGameOver = true;
        }

        // --- LOOP PRINCIPAL ---
        function loopPrincipal() {
            if (isGameOver) {
                mostrarTelaGameOver();
                return;
            }
            
            // Se todos os invasores forem derrotados, reinicia o nível (ou vence)
            if (invaders.length === 0) {
                pontuacao += 1000; // Bônus por limpar a tela
                invaderSpeed += 0.5; // Aumenta a dificuldade para o próximo nível
                criarInvasores();
            }

            // Limpa a tela
            ctx.clearRect(0, 0, LARGURA, ALTURA);
            
            // Processa, atualiza e desenha
            processarInput();
            
            player.atualizar();
            player.desenhar();
            
            atualizarTiros();
            desenharTiros();
            
            atualizarInvasores();
            desenharInvasores();
            
            desenharUI();
            
            checarColisoes();

            requestAnimationFrame(loopPrincipal);
        }

        // Event listener para reiniciar o jogo
        canvas.addEventListener('click', () => {
            if (isGameOver) {
                resetarJogo();
            }
        });

        // Inicia o jogo
        criarInvasores();
        loopPrincipal();
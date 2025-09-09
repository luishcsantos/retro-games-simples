// --- CONFIGURAÇÃO INICIAL ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        const LARGURA = canvas.width;
        const ALTURA = canvas.height;
        const ALTURA_CHAO = ALTURA - 50;

        // --- VARIÁVEIS DO JOGO ---
        let gravidade = 0.6;
        let pontuacao = 0;
        let isGameOver = false;
        let obstaculos = [];
        let frameCounter = 0;
        let proximoObstaculoFrame = 120; // Frame inicial para o primeiro obstáculo

        // --- JOGADOR ---
        const player = {
            x: 50,
            y: ALTURA_CHAO,
            largura: 30,
            altura: 50,
            velocidadeX: 0,
            velocidadeY: 0,
            forcaPulo: -15,
            estaNoChao: true,
            cor: '#D2691E', // Marrom (corpo)
            corCabeca: '#FFDAB9', // Peach (cabeça)

            desenhar: function() {
                // Corpo
                ctx.fillStyle = this.cor;
                ctx.fillRect(this.x, this.y - this.altura, this.largura, this.altura);
                // Cabeça
                ctx.fillStyle = this.corCabeca;
                ctx.fillRect(this.x + 5, this.y - this.altura - 10, this.largura - 10, 10);
            },

            atualizar: function() {
                // Lógica de movimento horizontal
                this.x += this.velocidadeX;

                // Lógica de pulo e gravidade
                if (!this.estaNoChao) {
                    this.velocidadeY += gravidade;
                    this.y += this.velocidadeY;
                }

                // Colisão com o chão
                if (this.y >= ALTURA_CHAO) {
                    this.y = ALTURA_CHAO;
                    this.velocidadeY = 0;
                    this.estaNoChao = true;
                }

                // Limites da tela
                if (this.x < 0) {
                    this.x = 0;
                }
                if (this.x + this.largura > LARGURA) {
                    this.x = LARGURA - this.largura;
                }
            },

            pular: function() {
                if (this.estaNoChao) {
                    this.velocidadeY = this.forcaPulo;
                    this.estaNoChao = false;
                }
            }
        };

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

        function processarInput() {
            if (teclas.ArrowLeft) {
                player.velocidadeX = -5;
            } else if (teclas.ArrowRight) {
                player.velocidadeX = 5;
            } else {
                player.velocidadeX = 0;
            }

            if (teclas[' ']) {
                player.pular();
            }
        }

        // --- OBSTÁCULOS ---
        function gerarObstaculo() {
            const tipo = Math.random() > 0.5 ? 'buraco' : 'tronco';
            
            if (tipo === 'buraco') {
                const larguraBuraco = 50 + Math.random() * 50;
                obstaculos.push({
                    x: LARGURA,
                    y: ALTURA_CHAO,
                    largura: larguraBuraco,
                    altura: 50,
                    tipo: 'buraco',
                    cor: '#000000' // Preto
                });
            } else { // tipo === 'tronco'
                obstaculos.push({
                    x: LARGURA,
                    y: ALTURA_CHAO - 40,
                    largura: 25,
                    altura: 40,
                    velocidade: 3 + Math.random() * 2,
                    tipo: 'tronco',
                    cor: '#8B4513' // Marrom escuro
                });
            }
        }
        
        function atualizarObstaculos() {
            for (let i = obstaculos.length - 1; i >= 0; i--) {
                let obs = obstaculos[i];
                
                if (obs.tipo === 'tronco') {
                    obs.x -= obs.velocidade;
                } else { // Buraco é estático, apenas parece se mover
                    obs.x -= 3; // Simula o movimento da câmera
                }
                
                // Remove obstáculos que saíram da tela
                if (obs.x + obs.largura < 0) {
                    obstaculos.splice(i, 1);
                }
            }
        }

        function desenharObstaculos() {
            obstaculos.forEach(obs => {
                ctx.fillStyle = obs.cor;
                ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
            });
        }

        // --- DETECÇÃO DE COLISÃO ---
        function checarColisoes() {
            obstaculos.forEach(obs => {
                // Detecção AABB (Axis-Aligned Bounding Box)
                const playerX = player.x;
                const playerY = player.y - player.altura; // Topo do jogador
                const playerLargura = player.largura;
                const playerAltura = player.altura;

                const obsX = obs.x;
                let obsY = obs.y;
                // Ajusta a hitbox do buraco para ser no nível do chão
                if (obs.tipo === 'buraco') {
                     obsY = obs.y; 
                }

                if (
                    playerX < obsX + obs.largura &&
                    playerX + playerLargura > obsX &&
                    playerY < obsY + obs.altura &&
                    playerY + playerAltura > obsY
                ) {
                    // Colisão com buraco (só se o jogador estiver no chão)
                    if (obs.tipo === 'buraco' && player.y >= ALTURA_CHAO) {
                        gameOver();
                    }
                    // Colisão com tronco
                    if (obs.tipo === 'tronco') {
                        gameOver();
                    }
                }
            });
        }

        // --- ELEMENTOS DO CENÁRIO ---
        function desenharCenario() {
            // Chão
            ctx.fillStyle = '#228B22'; // Verde Grama
            ctx.fillRect(0, ALTURA_CHAO, LARGURA, 50);

            // Sol
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(LARGURA - 80, 80, 40, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // --- UI (Interface do Usuário) ---
        function desenharUI() {
            ctx.fillStyle = 'white';
            ctx.font = '24px "Courier New"';
            ctx.textAlign = 'left';
            ctx.fillText(`PONTUAÇÃO: ${Math.floor(pontuacao)}`, 20, 30);
        }

        function mostrarTelaGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, LARGURA, ALTURA);
            
            ctx.fillStyle = 'white';
            ctx.font = '50px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', LARGURA / 2, ALTURA / 2 - 30);

            ctx.font = '20px "Courier New"';
            ctx.fillText(`Pontuação Final: ${Math.floor(pontuacao)}`, LARGURA / 2, ALTURA / 2 + 20);

            ctx.font = '16px "Courier New"';
            ctx.fillText('Clique para reiniciar', LARGURA / 2, ALTURA / 2 + 60);
        }

        // --- LÓGICA DO JOGO ---
        function resetarJogo() {
            player.x = 50;
            player.y = ALTURA_CHAO;
            player.velocidadeY = 0;
            player.estaNoChao = true;
            
            obstaculos = [];
            pontuacao = 0;
            frameCounter = 0;
            proximoObstaculoFrame = 120;
            isGameOver = false;
            
            loopPrincipal(); // Inicia o loop novamente
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

            // Atualiza o contador de frames e a pontuação
            frameCounter++;
            pontuacao += 0.1;

            // Gera novos obstáculos em intervalos variados
            if (frameCounter >= proximoObstaculoFrame) {
                gerarObstaculo();
                frameCounter = 0;
                // O próximo obstáculo aparecerá mais rápido com o tempo
                proximoObstaculoFrame = 80 + Math.random() * 80 - (pontuacao / 10);
                if (proximoObstaculoFrame < 60) proximoObstaculoFrame = 60; // Limite mínimo
            }

            // Limpa a tela
            ctx.clearRect(0, 0, LARGURA, ALTURA);
            
            // Processa, atualiza e desenha
            desenharCenario();
            processarInput();
            
            player.atualizar();
            player.desenhar();
            
            atualizarObstaculos();
            desenharObstaculos();

            desenharUI();

            checarColisoes();

            // Continua o ciclo
            requestAnimationFrame(loopPrincipal);
        }

        // Event listener para reiniciar o jogo
        canvas.addEventListener('click', () => {
            if (isGameOver) {
                resetarJogo();
            }
        });

        // Inicia o jogo
        loopPrincipal();
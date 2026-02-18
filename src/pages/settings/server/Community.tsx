import { observer } from "mobx-react-lite";
import styled from "styled-components/macro";
import { Text } from "preact-i18n";
import { InfoCircle, Check, Group, Bell, BarChartAlt2 } from "@styled-icons/boxicons-regular";
import { Button } from "@revoltchat/ui";
import { useState } from "preact/hooks";
import { Server } from "revolt.js";

interface Props {
    server: Server;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 16px;
    max-width: 800px;
    margin: 0 auto;
    animation: fadeIn 0.5s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const HeroSection = styled.div`
    position: relative;
    height: 240px;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
`;

const HeroContent = styled.div`
    position: relative;
    z-index: 1;
`;

const HeroTitle = styled.h1`
    font-size: 28px;
    font-weight: 800;
    color: white;
    margin-bottom: 12px;
`;

const HeroSub = styled.p`
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
    max-width: 500px;
    line-height: 1.5;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
`;

const FeatureCard = styled.div`
    background: var(--secondary-background);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
`;

const FeatureIcon = styled.div`
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
`;

const FeatureText = styled.div`
    h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 700;
        color: white;
    }
    p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-foreground);
        opacity: 0.8;
        line-height: 1.4;
    }
`;

const SetupSection = styled.div`
    background: var(--secondary-background);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
`;

const StatusBadge = styled.div<{ $active: boolean }>`
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$active ? "rgba(87, 242, 135, 0.1)" : "rgba(255, 255, 255, 0.05)"};
    color: ${props => props.$active ? "#57F287" : "var(--secondary-foreground)"};
    border: 1px solid ${props => props.$active ? "rgba(87, 242, 135, 0.2)" : "rgba(255, 255, 255, 0.1)"};
`;

const ToggleContainer = styled.div`
    width: 100%;
    max-width: 400px;
    
    button {
        width: 100%;
        height: 48px;
        font-weight: 700;
        border-radius: 12px;
    }
`;

export const Community = observer(({ server }: Props) => {
    const [enabled, setEnabled] = useState(false);

    return (
        <Container>
            <HeroSection>
                <HeroContent>
                    <HeroTitle>
                        <Text id="app.settings.server_pages.community.hero_title" />
                    </HeroTitle>
                    <HeroSub>
                        <Text id="app.settings.server_pages.community.hero_sub" />
                    </HeroSub>
                </HeroContent>
            </HeroSection>

            <FeatureGrid>
                <FeatureCard>
                    <FeatureIcon><Bell size={24} /></FeatureIcon>
                    <FeatureText>
                        <h4>Каналы объявлений</h4>
                        <p>Позвольте пользователям подписываться на ваши новости.</p>
                    </FeatureText>
                </FeatureCard>
                <FeatureCard>
                    <FeatureIcon><BarChartAlt2 size={24} /></FeatureIcon>
                    <FeatureText>
                        <h4>Аналитика сервера</h4>
                        <p>Узнайте больше о своей аудитории и активности.</p>
                    </FeatureText>
                </FeatureCard>
                <FeatureCard>
                    <FeatureIcon><Check size={24} /></FeatureIcon>
                    <FeatureText>
                        <h4>Экран приветствия</h4>
                        <p>Помогите новым участникам освоиться на вашем сервере.</p>
                    </FeatureText>
                </FeatureCard>
                <FeatureCard>
                    <FeatureIcon><Group size={24} /></FeatureIcon>
                    <FeatureText>
                        <h4>Поиск серверов</h4>
                        <p>Станьте видимыми для всех пользователей Zeelo.</p>
                    </FeatureText>
                </FeatureCard>
            </FeatureGrid>

            <SetupSection>
                <StatusBadge $active={enabled}>
                    <Text id="app.settings.server_pages.community.status" />
                    {enabled ? "ВКЛ" : "ВЫКЛ"}
                </StatusBadge>

                <p style={{ maxWidth: '500px', color: 'var(--secondary-foreground)', fontSize: '14px' }}>
                    <Text id="app.settings.server_pages.community.desc" />
                </p>

                <ToggleContainer>
                    <Button
                        palette={enabled ? "secondary" : "accent"}
                        onClick={() => setEnabled(!enabled)}
                    >
                        <Text id={enabled ? "app.settings.server_pages.community.disable" : "app.settings.server_pages.community.enable"} />
                    </Button>
                </ToggleContainer>
            </SetupSection>
        </Container>
    );
});

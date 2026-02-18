import { observer } from "mobx-react-lite";
import styled, { keyframes } from "styled-components/macro";
import { Text } from "preact-i18n";
import { Shield, Check, InfoCircle, Group, Chat, Star, Calendar, Cog, User } from "@styled-icons/boxicons-regular";
import { Button } from "@revoltchat/ui";
import { Server } from "revolt.js";

interface Props {
    server: Server;
}

const float = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

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
    height: 280px;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
`;

const MeshGradient = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
    opacity: 0.6;
`;

const Blob = styled.div<{ $color: string; $size: string; $top: string; $left: string; $duration: string }>`
    position: absolute;
    width: ${props => props.$size};
    height: ${props => props.$size};
    background: ${props => props.$color};
    filter: blur(60px);
    border-radius: 50%;
    top: ${props => props.$top};
    left: ${props => props.$left};
    animation: ${float} ${props => props.$duration} infinite ease-in-out;
    opacity: 0.4;
`;

const HeroContent = styled.div`
    position: relative;
    z-index: 1;
`;

const HeroTitle = styled.h1`
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin-bottom: 12px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.5px;
`;

const HeroSub = styled.p`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    max-width: 500px;
    line-height: 1.5;
`;

const GlassBanner = styled.div`
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const BannerIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
    flex-shrink: 0;
`;

const BannerText = styled.div`
    flex: 1;
    h3 {
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
    }
`;

const SectionTitle = styled.div`
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 800;
    color: var(--secondary-foreground);
    letter-spacing: 1px;
    margin-bottom: 8px;
    padding-left: 4px;
`;

const ConditionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
`;

const ConditionCard = styled.div`
    background: var(--secondary-background);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        background: var(--hover-background);
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
    }

    &:hover::after {
        transform: translateX(100%);
    }
`;

const CardIcon = styled.div`
    color: white;
    opacity: 0.9;
    margin-bottom: 4px;
`;

const CardTitle = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: white;
`;

const CardDesc = styled.div`
    font-size: 14px;
    color: var(--secondary-foreground);
    line-height: 1.5;
`;

const Footer = styled.div`
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 24px;
    border: 1px dashed var(--border);
`;

const ButtonWrapper = styled.div`
    width: 100%;
    max-width: 320px;
    
    button {
        width: 100%;
        height: 48px;
        font-weight: 700;
        border-radius: 12px;
        font-size: 15px;
        transition: all 0.2s ease;
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
`;

const ApplyHint = styled.div`
    font-size: 12px;
    color: var(--secondary-foreground);
    opacity: 0.6;
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const PartnerProgram = observer(({ server }: Props) => {
    return (
        <Container>
            <HeroSection>
                <MeshGradient>
                    <Blob $color="#5865F2" $size="300px" $top="-50px" $left="-50px" $duration="15s" />
                    <Blob $color="#EB459E" $size="250px" $top="150px" $left="60%" $duration="18s" />
                    <Blob $color="#57F287" $size="200px" $top="50px" $left="20%" $duration="12s" />
                </MeshGradient>
                <HeroContent>
                    <HeroTitle>
                        <Text id="app.settings.server_pages.partner.hero_title" />
                    </HeroTitle>
                    <HeroSub>
                        <Text id="app.settings.server_pages.partner.hero_sub" />
                    </HeroSub>
                </HeroContent>
            </HeroSection>

            <GlassBanner>
                <BannerIcon>
                    <InfoCircle size={28} />
                </BannerIcon>
                <BannerText>
                    <h3><Text id="app.settings.server_pages.partner.title" /></h3>
                    <p><Text id="app.settings.server_pages.partner.dev_notice" /></p>
                </BannerText>
            </GlassBanner>

            <div>
                <SectionTitle>
                    <Text id="app.settings.server_pages.partner.conditions_title" />
                </SectionTitle>
                <ConditionsGrid>
                    <ConditionCard>
                        <CardIcon>
                            <Chat size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_1_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_1_desc" />
                        </CardDesc>
                    </ConditionCard>
                    <ConditionCard>
                        <CardIcon>
                            <Shield size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_2_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_2_desc" />
                        </CardDesc>
                    </ConditionCard>
                    <ConditionCard>
                        <CardIcon>
                            <Star size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_3_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_3_desc" />
                        </CardDesc>
                    </ConditionCard>
                    <ConditionCard>
                        <CardIcon>
                            <Calendar size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_4_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_4_desc" />
                        </CardDesc>
                    </ConditionCard>
                    <ConditionCard>
                        <CardIcon>
                            <Cog size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_5_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_5_desc" />
                        </CardDesc>
                    </ConditionCard>
                    <ConditionCard>
                        <CardIcon>
                            <User size={32} />
                        </CardIcon>
                        <CardTitle>
                            <Text id="app.settings.server_pages.partner.condition_6_title" />
                        </CardTitle>
                        <CardDesc>
                            <Text id="app.settings.server_pages.partner.condition_6_desc" />
                        </CardDesc>
                    </ConditionCard>
                </ConditionsGrid>
            </div>

            <Footer>
                <ButtonWrapper>
                    <Button palette="plain" disabled>
                        <Text id="app.settings.server_pages.partner.apply_button" />
                    </Button>
                </ButtonWrapper>
                <ApplyHint>
                    <InfoCircle size={14} />
                    <Text id="app.settings.server_pages.partner.apply_hint" />
                </ApplyHint>
            </Footer>
        </Container>
    );
});

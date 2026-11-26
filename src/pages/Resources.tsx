import { useMemo, useState } from 'react'
import { Check, Download } from '../components/ui/icons'

type Resource = { id: string; category: string; title: string; reference: string; body: string }

const encouragement: Resource[] = [
  { id: 'new-convert', category: 'New converts', title: 'Keep growing in the grace you have received', reference: '2 Peter 3:18', body: 'Your journey with Christ has begun, and there is room to keep growing. Take time to pray, read the Word, and remain connected to other believers. You do not have to understand everything at once; keep taking faithful steps with the Lord.' },
  { id: 'absent', category: 'Absent members', title: 'You are remembered', reference: 'Hebrews 10:24–25', body: 'We noticed your absence and wanted to check how you are doing. You are valued, and we would love to see you again when you are able. Is there anything we can pray with you about?' },
  { id: 'discouraged', category: 'Discouraged believers', title: 'Do not lose heart', reference: 'Galatians 6:9', body: 'A difficult season does not mean that God has abandoned you. Keep trusting Him one day at a time. You are not expected to carry everything alone; let us stand with you in prayer and fellowship.' },
  { id: 'fellowship', category: 'Fellowship consistency', title: 'Keep making room for fellowship', reference: 'Hebrews 10:24–25', body: 'Our faith is strengthened as we encourage one another. Let us keep making room for the gathering of believers, mutual care, and the sharing of God’s Word.' },
  { id: 'prayer-study', category: 'Prayer and Bible study', title: 'Build a steady rhythm with God', reference: 'Colossians 4:2', body: 'You do not need a complicated routine to begin. Set aside a consistent time to speak with God and listen to His Word. Small, faithful steps can help establish a deeper life of prayer and Scripture.' },
  { id: 'difficult-season', category: 'Difficult seasons', title: 'You do not have to walk alone', reference: 'Romans 12:15', body: 'I am sorry this season has been difficult. I may not have all the answers, but I am willing to listen and pray with you. Please let me know how we can support you in a practical way.' },
  { id: 'fervency', category: 'Spiritual fervency', title: 'Stir up your devotion again', reference: 'Romans 12:11', body: 'If your spiritual routine has become quiet, you can begin again. Return to prayer, the Scriptures, fellowship and obedience, trusting the Lord for renewed strength and desire.' },
]

const paulinePrayers: Resource[] = [
  { id: 'eph1', category: 'Spiritual understanding', title: 'Prayer for revelation and enlightened understanding', reference: 'Ephesians 1:15–23', body: 'Father, grant us the spirit of wisdom and revelation in the knowledge of You. Enlighten the eyes of our understanding, that we may know the hope of Your calling, the riches of Your inheritance in the saints, and the exceeding greatness of Your power toward us who believe. Establish our hearts in the truth of Christ, who is exalted above every principality and power. Amen.' },
  { id: 'eph3', category: 'Strength and love', title: 'Prayer for inner strength and the fullness of God', reference: 'Ephesians 3:14–21', body: 'Father, strengthen us with might by Your Spirit in our inner man. Let Christ dwell in our hearts by faith. Root and ground us in love, and help us comprehend the breadth, length, depth and height of the love of Christ. Fill us with all Your fullness, and do in us beyond what we can ask or think, according to Your power at work within us. Amen.' },
  { id: 'phil1', category: 'Love and discernment', title: 'Prayer for growing love and wise choices', reference: 'Philippians 1:9–11', body: 'Lord, cause our love to abound more and more in knowledge and in all judgment. Help us discern what is excellent, walk sincerely, and be filled with the fruits of righteousness which come through Jesus Christ, to the glory and praise of God. Amen.' },
  { id: 'col1', category: 'Fruitfulness and wisdom', title: 'Prayer for knowledge of God’s will', reference: 'Colossians 1:9–14', body: 'Father, fill us with the knowledge of Your will in all wisdom and spiritual understanding. Teach us to walk worthy of You, pleasing You in every good work, increasing in the knowledge of God. Strengthen us with Your glorious power for patience, endurance and joy, and keep us thankful for the redemption we have in Christ. Amen.' },
  { id: '1thess3', category: 'Love and holiness', title: 'Prayer for abundant love and steadfast hearts', reference: '1 Thessalonians 3:12–13', body: 'Lord, make our love increase and overflow toward one another and toward all people. Establish our hearts blameless in holiness before You, and teach us to live in readiness and faithfulness before the coming of our Lord Jesus Christ. Amen.' },
  { id: '2thess1', category: 'Faith and perseverance', title: 'Prayer that God fulfils every good purpose', reference: '2 Thessalonians 1:11–12', body: 'God, count us worthy of Your calling. Fulfil every good purpose and work of faith by Your power. Let the name of our Lord Jesus be glorified in us, and let our lives reflect His grace, for the glory of our God and the Lord Jesus Christ. Amen.' },

  { id: 'inheritance-in-christ', category: 'Inheritance in Christ', title: 'Knowing the riches of our inheritance in Christ', reference: 'Ephesians 1:3–14; Ephesians 1:15–23; Romans 8:14–17; Colossians 1:12–14', body: `TEACHING

The Christian life begins with what God has done in Christ, not with what we can achieve by religious effort. Ephesians 1 opens by blessing God because He has blessed believers with every spiritual blessing in heavenly places in Christ. The passage describes adoption, acceptance in the Beloved, redemption through Christ’s blood, forgiveness, the revelation of God’s purpose, and the sealing of the Holy Spirit. These are not wages earned by spiritual performance; they are gifts of grace received in union with Christ.

Our inheritance is both present and future. We have already been brought into God’s family and given the Spirit as the earnest (guarantee) of our inheritance (Ephesians 1:13–14; Romans 8:15–17). We are also waiting for the full redemption of our bodies and the consummation of what God has promised (Romans 8:23; 1 Peter 1:3–5). This hope gives stability in suffering and courage in service.

Paul does not merely ask that believers receive more things; he prays that the eyes of their understanding will be enlightened so they may know the hope of God’s calling, the riches of His inheritance in the saints, and the immeasurable greatness of His power toward believers (Ephesians 1:17–20). We therefore need revelation of what is already ours in Christ, so that fear, inferiority, and worldly definitions of success do not govern us.

CHRIST-CENTRED EMPHASIS

Every blessing in this passage is located in Christ. He is the Beloved in whom we are accepted, the Redeemer through whose blood we have forgiveness, and the risen Lord exalted above every rule and authority. Our confidence is not in our own strength but in the same mighty power God displayed when He raised Christ from the dead (Ephesians 1:19–23).

PRAYER

Father, God of our Lord Jesus Christ, give us the spirit of wisdom and revelation in the knowledge of You. Enlighten the eyes of our understanding. Cause us to know the hope of Your calling, the riches of the glory of Your inheritance in the saints, and the exceeding greatness of Your power toward us who believe. Establish our hearts in our adoption, redemption, forgiveness, and acceptance in Christ. Let the reality of our inheritance shape our choices, courage, holiness, generosity, and service. Keep our hope fixed on Jesus, in whose name we pray. Amen.

PRAY THROUGH

Read Ephesians 1:3–14 slowly. Identify each blessing that is explicitly said to be in Christ. Then pray Ephesians 1:17–23 for the church, naming areas where believers need enlightened understanding.` },
  { id: 'gospel-boldness', category: 'Gospel courage and endurance', title: 'Boldness, clarity and endurance in the gospel', reference: 'Ephesians 6:18–20; Colossians 4:2–4; 2 Thessalonians 3:1–5; 2 Timothy 1:7–14', body: `TEACHING

Paul understood gospel ministry as a stewardship entrusted to him by God. Even while imprisoned, he asked the churches to pray that utterance would be given to him, that he might open his mouth boldly to make known the mystery of the gospel (Ephesians 6:19–20). His request teaches us that boldness is not self-confidence, aggression, or a desire to win arguments. It is Spirit-dependent courage to speak the truth of Christ clearly, lovingly, and without shame.

Colossians 4:3–4 joins two important requests: that God would open a door for the word, and that Paul would make the message clear. We should pray both for opportunities and for faithfulness in using them. An open door without clarity can be wasted; eloquence without love can wound hearers. The gospel itself remains the power of God unto salvation (Romans 1:16).

In 2 Thessalonians 3:1–5 Paul asks that the word of the Lord may have free course and be glorified, and that believers be delivered from unreasonable and wicked men. He then directs their hearts into the love of God and the patient waiting for Christ. Gospel courage therefore belongs with prayer, protection, love, patience, and obedience.

PRAYER

Lord Jesus, make us unashamed of Your gospel. Open doors for Your word among our families, neighbourhoods, workplaces, schools, and communities. Give us utterance and clarity to make the mystery of Christ known. Deliver us from fear of people, from compromise, and from the temptation to alter the message for acceptance. Let Your word run swiftly and be honoured. Strengthen those who preach, teach, translate, serve, and witness under pressure. Guard them from unreasonable and wicked opposition, and keep their hearts in the love of God and the patience of Christ. Make our conduct worthy of the gospel we proclaim. Amen.

PRAY THROUGH

Pray by name for gospel workers and for people who have not yet believed. Ask for an open door (Colossians 4:3), a clear message (Colossians 4:4), boldness (Ephesians 6:19–20), and protection (2 Thessalonians 3:2).` },
  { id: 'comfort-in-trouble', category: 'Comfort and strengthening', title: 'Comfort for the afflicted and strength to endure', reference: '2 Corinthians 1:3–7; Ephesians 3:14–21; Philippians 4:6–9; 2 Thessalonians 2:16–17', body: `TEACHING

Paul calls God “the Father of mercies, and the God of all comfort” (2 Corinthians 1:3). God’s comfort is not a denial that pain is real. Paul speaks honestly about affliction, pressure, and despair, yet testifies that God comforted him so that he could comfort others. The comfort received from God becomes a ministry we extend to people who suffer.

In Ephesians 3:14–21, Paul prays for believers who already belong to Christ. He asks the Father to strengthen them with might by His Spirit in the inner person, that Christ may dwell in their hearts by faith, and that they may be rooted and grounded in love. Christian strength is not merely the ability to endure difficult circumstances; it is inward strengthening through the Spirit and a deeper grasp of Christ’s love.

Philippians 4:6–9 does not instruct sufferers to pretend everything is fine. It invites them to bring every concern to God with prayer, supplication, and thanksgiving. God’s peace guards hearts and minds in Christ Jesus. Paul also teaches believers to direct their minds toward what is true, honest, just, pure, lovely, and worthy of praise.

PRAYER

Father of mercies and God of all comfort, draw near to those who are grieving, anxious, exhausted, sick, persecuted, or overwhelmed. Strengthen them by Your Spirit in the inner person. Let the love of Christ become more real to them than the weight of their present trouble. Give wisdom for decisions, grace to ask for help, and people who will listen without judging. Guard hearts and minds with Your peace in Christ Jesus. Make us a community that bears burdens, speaks truth gently, and comforts others with the comfort we have received from You. Amen.

PASTORAL CARE

Prayer should be accompanied by practical love. Listen carefully, respect confidentiality, help with genuine needs, and encourage appropriate medical, counselling, or professional support when needed (Galatians 6:2; Romans 12:15; James 2:15–17). Do not use these passages to shame someone who is suffering.` },
  { id: 'provision-contentment', category: 'God’s provision and contentment', title: 'Trusting the Father for provision and learning contentment', reference: 'Philippians 4:10–20; 2 Corinthians 9:6–11; Matthew 6:25–34; 1 Timothy 6:6–10, 17–19', body: `TEACHING

Philippians 4:19 is often quoted on its own, but its setting matters. Paul is thanking the Philippians for their generous partnership in his ministry. He has learned contentment in abundance and in need (Philippians 4:11–13), and he assures them that God will supply their need according to His riches in glory by Christ Jesus. This is not a promise that every believer will receive every desired luxury or become wealthy. It is confidence in God’s faithful care, expressed in a passage about generosity, partnership, and contentment.

Jesus teaches us not to be consumed by anxious striving for food and clothing, because our heavenly Father knows what we need (Matthew 6:25–34). He calls us to seek first God’s kingdom and righteousness. Second Corinthians 9:6–11 connects provision with generosity: God supplies seed to the sower and bread for food, enabling believers to abound in good works. Provision is not merely for private accumulation; it equips us to serve and share.

The church should therefore pray for daily needs, honest work, wisdom, open doors, relief for those in hardship, and freedom from greed. We should also become part of God’s practical answer through generosity, fair dealing, employment opportunities, hospitality, and care for the vulnerable.

PRAYER

Our Father, You know what we need before we ask. Provide daily bread, honest employment, wisdom in stewardship, strength to work, and help in seasons of lack. Give relief to families under financial pressure and provide through just and compassionate means. Deliver us from greed, waste, dishonest gain, and anxious comparison. Teach us contentment in every circumstance and make us generous toward others. Supply what is needed for the work of the gospel, and let Your provision produce thanksgiving and good works through Jesus Christ. Amen.

PRAY THROUGH

Name practical needs before God. Then ask: What responsibility, wise step, or act of generosity is God calling us to take? Read Philippians 4:10–20 in full so that verse 19 remains connected to contentment and partnership in the gospel.` },
  { id: 'deliverance-protection', category: 'Protection and deliverance', title: 'Deliverance from danger and from wicked opposition', reference: '2 Thessalonians 3:1–5; Romans 15:30–33; 2 Corinthians 1:8–11; 2 Timothy 4:16–18; Psalm 91', body: `TEACHING

The New Testament does not hide the reality of danger. Paul faced violent opposition, imprisonment, threats, hardship, and situations in which he despaired even of life (2 Corinthians 1:8–11). He asked churches to strive together with him in prayer for deliverance (Romans 15:30–33). In 2 Thessalonians 3:1–2, he asks prayer both for the progress of the gospel and for deliverance from unreasonable and wicked people.

God’s protection does not mean believers will never suffer. Paul also records occasions when he was beaten, imprisoned, and exposed to danger (2 Corinthians 11:23–28). Yet he testifies that the Lord stood by him and strengthened him (2 Timothy 4:16–18). Biblical prayer asks boldly for rescue while trusting God’s wisdom when the path includes suffering. Psalm 91 gives language of refuge and confidence in God; it should not be turned into a formula that guarantees a trouble-free life.

Pray for protection from violence, exploitation, deception, accidents, unjust treatment, and every form of wicked opposition. Pray also for discernment, wise decisions, lawful help, safe travel, and courage to seek refuge when danger is immediate. Do not confuse deliverance with retaliation; believers are commanded to overcome evil with good (Romans 12:17–21).

PRAYER

Faithful Lord, be our refuge and strength, a very present help in trouble. Deliver Your people from violent and wicked opposition, from traps and deception, from unjust accusations, and from dangers seen and unseen. Preserve those travelling, serving, preaching, and caring for others. Give discernment to recognise danger and wisdom to take safe and responsible action. Strengthen those facing threats; provide timely help, trustworthy companions, and just intervention. When we pass through hardship, stand by us and keep us faithful to Christ. Make us courageous without becoming vengeful, and peaceful without becoming careless. Amen.

PRAY THROUGH

Pray for specific people, journeys, ministries, and vulnerable communities. Ask God for protection and also for practical wisdom, accountability, and appropriate help. Read 2 Corinthians 1:8–11 and 2 Timothy 4:16–18 together to see both the reality of danger and the Lord’s sustaining faithfulness.` },
  { id: 'spiritual-fervency', category: 'Spiritual fervency', title: 'Fervent in spirit, serving the Lord', reference: 'Romans 12:1–12; Colossians 4:2; 1 Thessalonians 5:16–24; 2 Timothy 1:6–7', body: `TEACHING

Romans 12 begins with the mercies of God. Paul calls believers to present their bodies as living sacrifices and to be transformed by the renewing of their minds (Romans 12:1–2). In that context he says, “not slothful in business; fervent in spirit; serving the Lord” (Romans 12:11, KJV). Fervency is not noise, emotional excitement, or constant activity. It is an earnest, Spirit-shaped devotion that expresses itself in service, prayer, generosity, patience, and love.

Colossians 4:2 says to continue in prayer, watching in the same with thanksgiving. First Thessalonians 5:16–24 joins joy, prayer, thanksgiving, discernment, holiness, and dependence on the God who sanctifies. Second Timothy 1:6–7 urges Timothy to stir up the gift of God and reminds him that God has given a spirit not of fear, but of power, love, and a sound mind.

Spiritual fire must remain governed by Scripture and love. Zeal without knowledge can harm; activity without love becomes empty (Romans 10:2; 1 Corinthians 13:1–3). We ask God for renewed devotion that produces obedience and Christlike character.

PRAYER

Lord, renew our devotion to You. Deliver us from spiritual laziness, distraction, coldness, and the desire for appearance without obedience. By Your Spirit, make us fervent in spirit and diligent in serving the Lord. Restore delight in Your Word, constancy in prayer, love for Your people, compassion for the lost, and joy in doing Your will. Stir up the gifts You have entrusted to us and govern every zeal with truth, humility, love, and a sound mind. Let our private devotion and public service honour Jesus. Amen.

PRACTICE

Choose a sustainable rhythm: Scripture, prayer, fellowship, obedience, and service. Do not measure spiritual life only by feelings. Ask what faithful obedience looks like today (James 1:22–25; Galatians 5:22–25).` },
  { id: 'godly-desires', category: 'Renewed desires and holiness', title: 'Ignite holy desires and shape our will after God', reference: 'Philippians 2:12–13; Psalm 63:1–8; Psalm 119:33–40; Galatians 5:16–25; 2 Thessalonians 1:11–12', body: `TEACHING

Philippians 2:12–13 holds human responsibility and divine working together: believers are called to work out their salvation with reverence, because God works in them both to will and to do of His good pleasure. The passage does not teach that we earn salvation. It teaches that the God who saves is also at work shaping our desires and actions.

We can ask God not only to change our circumstances but to change what we love. Psalm 63 describes a soul thirsting for God; Psalm 119 repeatedly asks the Lord to incline the heart toward His testimonies and away from covetousness. Galatians 5 contrasts the works of the flesh with the fruit of the Spirit. Renewed desire is therefore not simply wanting religious experiences; it is growing love for Christ, truth, holiness, justice, mercy, prayer, Scripture, and the good of others.

Second Thessalonians 1:11–12 gives a deeply Pauline pattern: that God would fulfil every good resolve and work of faith by His power, so that the name of Jesus may be glorified in believers. We pray for desires that God Himself approves and for power to put those desires into practice.

PRAYER

Father, work in us both to will and to do of Your good pleasure. Reorder our loves. Give us hunger for Your Word, delight in prayer, affection for Christ, hatred of sin, compassion for people, and willingness to obey when obedience is costly. Turn our hearts from empty distractions, envy, greed, lust, bitterness, and the craving for human applause. Fulfil every good purpose and every work of faith by Your power, so that Jesus may be glorified in us. Amen.

REFLECTION

Ask: What desire is shaping my decisions? Does it agree with the character and teaching of Christ? What habit, relationship, or practice needs to change so that a godly desire can become obedient action?` },
  { id: 'steadfast-under-pressure', category: 'Perseverance and gospel labour', title: 'Steadfastness when the work is difficult', reference: '2 Corinthians 4:1–18; 1 Corinthians 15:58; Galatians 6:9–10; 2 Timothy 2:1–13', body: `TEACHING

Paul’s ministry was marked by hardship, but he says, “seeing we have this ministry, as we have received mercy, we faint not” (2 Corinthians 4:1, KJV). He describes being troubled but not distressed, perplexed but not in despair, persecuted but not forsaken, cast down but not destroyed (2 Corinthians 4:8–9). The treasure is the gospel; the power belongs to God, not to the human messenger (2 Corinthians 4:7).

Paul fixes attention beyond temporary affliction to the eternal weight of glory (2 Corinthians 4:16–18). This does not make suffering unreal; it places suffering within the larger hope of resurrection and the coming renewal. In 1 Corinthians 15:58, the assurance of resurrection leads directly to steadfast labour: our labour is not in vain in the Lord.

Galatians 6:9–10 calls believers not to grow weary in doing good. Second Timothy 2:1–13 calls servants of Christ to be strengthened by grace and endure hardship. Perseverance is not stubborn self-reliance; it is sustained faithfulness through the grace of Christ.

PRAYER

Lord Jesus, strengthen every weary worker and believer. When we are troubled, keep us from despair; when we are opposed, remind us that we are not forsaken. Renew our inward person day by day. Keep our eyes fixed on the risen Christ and the eternal hope You have promised. Give us endurance to preach, disciple, serve, forgive, give, and do good without surrendering to discouragement. Let us be steadfast, unmoveable, and always abounding in Your work, knowing that our labour is not in vain in You. Amen.` },
  { id: 'church-love-unity', category: 'Church love and unity', title: 'A church established in love, truth and mutual care', reference: 'Ephesians 4:1–16; Philippians 2:1–5; Colossians 3:12–17; Romans 15:5–7', body: `TEACHING

Paul’s vision of the church is not a crowd of isolated believers but one body joined to Christ the Head. Ephesians 4 calls the church to walk in humility, meekness, patience, and love, endeavouring to keep the unity of the Spirit in the bond of peace. Unity is not pretending that differences or problems do not exist. It is a Spirit-created reality that believers are responsible to preserve through truth, humility, forgiveness, and patient love.

Ephesians 4:11–16 teaches that Christ gives ministry gifts to equip the saints for the work of service, so that the body grows toward maturity. Healthy ministry does not make people dependent on one personality; it equips the whole body to grow in Christ. Colossians 3:12–17 describes the practical clothing of the new life: compassion, kindness, humility, meekness, patience, forgiveness, love, peace, gratitude, and the word of Christ dwelling richly.

PRAYER

Lord Jesus, Head of the church, establish us in truth and love. Clothe us with compassion, humility, patience, forgiveness, and kindness. Heal divisions, expose harmful pride, and teach us to speak the truth in love. Equip every believer to serve, and help our leaders equip rather than control. Let the word of Christ dwell richly among us, and let our unity make the beauty of the gospel visible. Amen.` },
  {"id":"pauline-prayer-map","category":"Pauline prayer and intercession","title":"A prayer map from Paul: knowledge, character, power and mission","reference":"Ephesians 1:15–23; 3:14–21; Philippians 1:9–11; Colossians 1:9–14; 2 Thessalonians 1:11–12","body":"TEACHING\n\nPaul’s prayers show what mature Christian intercession values. He prays that believers know God more deeply, understand their calling and inheritance, grow in love and discernment, bear fruit, endure hardship, and live in a way that honours Christ. These petitions are shaped by the gospel and aimed at forming a Christlike people.\n\nIn Ephesians 1:17–19, Paul asks for wisdom and revelation in knowing God and for enlightened hearts to grasp the hope of His calling, the riches of His inheritance, and His power toward believers. Ephesians 3:16–19 adds inner strengthening, Christ dwelling in the heart by faith, deep roots in love, and a growing comprehension of Christ’s love. Philippians 1:9–11 adds discerning love, sincerity, and the fruit of righteousness through Jesus Christ. Colossians 1:9–14 asks for knowledge of God’s will, a worthy walk, fruitfulness, strength for patience, and gratitude for redemption.\n\nA prayer meeting can move from revelation to transformation, from transformation to service, and from service to thanksgiving: know Christ; become like Christ; bear witness to Christ; give thanks for Christ.\n\nPRAYER\n\nFather of our Lord Jesus Christ, grant our church wisdom and revelation in knowing You. Enlighten our hearts to understand the hope of Your calling and the riches of our inheritance in Christ. Strengthen us inwardly by Your Spirit; root us deeply in the love of Jesus. Let our love abound with knowledge and discernment. Fill us with the knowledge of Your will, make us fruitful in every good work, and strengthen us for patience, endurance, and joy. Fulfil every good purpose and work of faith by Your power, so that Jesus Christ is honoured in our lives. Amen.\n\nHOW TO USE\n\nChoose one Pauline passage each day. Read the whole paragraph, identify what Paul asks God to do, and pray those requests for your church, leaders, workers, new believers, families, and people you are discipling."},
  {"id":"comfort-consolation-deep","category":"Comfort and consolation","title":"The God of all comfort: consolation in grief, anxiety and weariness","reference":"2 Corinthians 1:3–11; Romans 8:18–39; Philippians 4:4–9; 1 Thessalonians 4:13–18","body":"TEACHING\n\nPaul blesses “the God and Father of our Lord Jesus Christ, the Father of mercies, and the God of all comfort” (2 Corinthians 1:3, KJV). He does not describe comfort as escape from every painful circumstance. He speaks of real affliction and of God sustaining His people within it. The comfort God gives equips us to come alongside others with compassion rather than easy explanations.\n\nRomans 8 offers strong consolation: believers are children and heirs with Christ (vv. 14–17); present sufferings cannot compare with the glory to come (v. 18); the Spirit helps our weakness and intercedes (vv. 26–27); and nothing in creation can separate us from God’s love in Christ (vv. 31–39). These assurances do not trivialise tears. They give suffering people a secure place to bring them.\n\nFor anxiety, Philippians 4:6–9 invites honest prayer, supplication, and thanksgiving, and promises God’s peace to guard heart and mind in Christ. For grief, 1 Thessalonians 4:13–18 does not forbid mourning; it gives believers hope because Jesus died and rose again, and those who belong to Him will not be lost to death forever.\n\nPRAYER\n\nFather of mercies, draw near to those who mourn, fear, feel alone, or have grown weary. Let the Holy Spirit help them in weakness and remind them that they are not separated from Your love in Christ. Guard their hearts and minds with Your peace. Give them companions who listen patiently, practical help for the burdens they carry, and hope rooted in the resurrection of Jesus. Teach us as a church to weep with those who weep, carry burdens faithfully, and comfort without minimising pain. Amen.\n\nCARE AND RESPONSE\n\nAsk what practical support would help. Offer a listening ear, meals, transport, help with daily tasks, or a safe pastoral conversation. Prayer and practical care belong together (Galatians 6:2; James 2:15–17). Encourage appropriate medical or counselling support when it is needed; seeking help is not a failure of faith."},
  {"id":"inheritance-lived","category":"Inheritance in Christ","title":"Living from our inheritance: accepted, adopted, sealed and made alive in Christ","reference":"Ephesians 1:3–14; Romans 8:14–17, 23; Colossians 1:12–14; Galatians 4:4–7; 1 Peter 1:3–5","body":"TEACHING\n\nThe New Testament describes the believer’s inheritance through the saving work of the Father, Son, and Holy Spirit. The Father adopts us; the Son redeems us through His blood and brings forgiveness; the Spirit seals us and is the earnest of our inheritance (Ephesians 1:3–14). These blessings are received in Christ, not earned through religious achievement.\n\nRomans 8:14–17 says that those led by the Spirit are God’s children and heirs, fellow-heirs with Christ. The passage also acknowledges that sharing in Christ includes suffering with Him and, ultimately, being glorified with Him. Verse 23 looks forward to the redemption of our bodies: our inheritance is already secured in promise, yet its fullness is still awaited.\n\nColossians 1:12–14 celebrates the Father who has made believers meet to share in the inheritance of the saints in light, delivered them from the power of darkness, translated them into the kingdom of His dear Son, and granted redemption and forgiveness. The centre is not a promise of uninterrupted earthly comfort; it is a new status, a new kingdom, a new hope, and a new life under the lordship of Jesus.\n\nThis inheritance should shape identity and conduct. We can serve without trying to earn acceptance, endure without surrendering hope, give without fear-driven hoarding, and pursue holiness because we belong to Christ.\n\nPRAYER\n\nFather, thank You that in Christ You have blessed, adopted, redeemed, forgiven, and sealed us with Your Spirit. Help us live as Your children and heirs. Deliver us from shame, spiritual pride, fear, and the false measures of worth offered by the world. Fix our hope on the inheritance kept for us and the resurrection life to come. Let our assurance produce humility, holiness, generosity, courage, and faithful service to Jesus. Amen.\n\nSTUDY QUESTIONS\n\nWhat blessings does Ephesians 1 explicitly locate in Christ? What does the Spirit seal assure us of? How does Romans 8 hold present suffering and future glory together? What change should our identity as God’s children produce in daily life?"},
  {"id":"gospel-door-endurance","category":"Gospel courage and endurance","title":"Open doors, clear speech and enduring faithfulness in gospel work","reference":"Colossians 4:2–6; Ephesians 6:18–20; 2 Thessalonians 3:1–5; 2 Corinthians 4:1–18","body":"TEACHING\n\nPaul asks the church to pray for an open door for the word and for clarity in communicating the mystery of Christ (Colossians 4:3–4). He also asks for boldness while describing himself as an ambassador in chains (Ephesians 6:19–20). Gospel courage is not bravado or harshness. It is dependence on God to speak truthfully, graciously, and without shame, even when circumstances are costly.\n\nColossians 4:5–6 joins witness with wise conduct: walk in wisdom toward outsiders, make good use of opportunities, and let speech be gracious and seasoned with salt. Our manner should not contradict the message. We seek both an open door and a faithful witness once the door opens.\n\nSecond Thessalonians 3:1–5 asks that the word of the Lord may run and be glorified, and that believers be delivered from wicked and unreasonable opposition. Paul then prays that their hearts be directed into God’s love and Christ’s patience. Protection, endurance, love, and mission belong together.\n\nSecond Corinthians 4 reminds gospel servants that they have received ministry by mercy and therefore do not faint. The treasure is carried in fragile vessels so that the excellency of the power may be of God (vv. 7–9). Our weakness does not make the gospel weak; it reminds us that its power is God’s.\n\nPRAYER\n\nLord Jesus, open doors for the gospel among our neighbours, families, communities, and nations. Give us clear words, gracious speech, wisdom toward those outside the faith, and courage when we face rejection. Let Your word run swiftly and be honoured. Deliver Your servants from wicked opposition and preserve them from bitterness or retaliation. Renew those who are weary; remind them that the treasure is Yours and the power belongs to You. Make us faithful ambassadors who display the character of Christ. Amen.\n\nPRAY AND ACT\n\nName a person or community for whom you are praying. Ask for an open door, a clear message, a gracious manner, and perseverance. Then take one wise, loving step toward that person or community."}
]

const scriptures: Resource[] = [
  { id: 'love', category: 'Love and unity', title: 'A new commandment', reference: 'John 13:34 (KJV)', body: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.' },
  { id: 'unity', category: 'Love and unity', title: 'Dwelling together in unity', reference: 'Psalm 133:1 (KJV)', body: 'Behold, how good and how pleasant it is for brethren to dwell together in unity!' },
  { id: 'faith', category: 'Faith and trust in God', title: 'The substance of faith', reference: 'Hebrews 11:1 (KJV)', body: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { id: 'trust', category: 'Faith and trust in God', title: 'Trust in the Lord', reference: 'Proverbs 3:5–6 (KJV)', body: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { id: 'prayer', category: 'Prayer', title: 'Continue in prayer', reference: 'Colossians 4:2 (KJV)', body: 'Continue in prayer, and watch in the same with thanksgiving;' },
  { id: 'pray-always', category: 'Prayer', title: 'Pray without ceasing', reference: '1 Thessalonians 5:17 (KJV)', body: 'Pray without ceasing.' },
  { id: 'growth', category: 'Spiritual growth', title: 'Grow in grace', reference: '2 Peter 3:18 (KJV)', body: 'But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ. To him be glory both now and for ever. Amen.' },
  { id: 'evangelism', category: 'Evangelism', title: 'Go into all the world', reference: 'Mark 16:15 (KJV)', body: 'And he said unto them, Go ye into all the world, and preach the gospel to every creature.' },
  { id: 'endurance', category: 'Endurance', title: 'Do not grow weary', reference: 'Galatians 6:9 (KJV)', body: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.' },
  { id: 'character', category: 'Christian character', title: 'The fruit of the Spirit', reference: 'Galatians 5:22–23 (KJV)', body: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.' },
  { id: 'encouragement', category: 'Encouragement', title: 'Steadfast labour in the Lord', reference: '1 Corinthians 15:58 (KJV)', body: 'Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.' },
  { id: 'provision', category: 'God’s provision', title: 'God supplies our need', reference: 'Philippians 4:19 (KJV)', body: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.' },
]

const tabs = ['Encouragement', 'Pauline Prayers', 'Scripture Library'] as const

export default function Resources() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Encouragement')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [copied, setCopied] = useState('')

  const source = tab === 'Encouragement' ? encouragement : tab === 'Pauline Prayers' ? paulinePrayers : scriptures
  const categories = useMemo(() => ['All', ...Array.from(new Set(source.map((item) => item.category)))], [source])
  const visible = source.filter((item) =>
    (category === 'All' || item.category === category)
    && `${item.title} ${item.reference} ${item.body} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  )

  const copy = async (item: Resource) => {
    const text = `${item.title}\n${item.reference}\n\n${item.body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(item.id)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      alert('Copy is unavailable in this browser. Please select and copy the text manually.')
    }
  }

  return (
    <div className="space-y-6">
      <header><p className="eyebrow">Ministry library</p><h1 className="page-title mt-3">Spiritual Resources</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Scripture-grounded encouragement, Pauline prayers and Bible passages for personal growth and thoughtful follow-up.</p></header>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
        {tabs.map((item) => <button key={item} onClick={() => { setTab(item); setCategory('All') }} className={`px-3 py-2 text-sm font-semibold ${tab === item ? 'border-b-2 border-gold-500 text-slate-950 dark:text-white' : 'text-slate-500'}`}>{item}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_16rem]">
        <input className="input" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <p className="text-xs text-slate-500">{visible.length} resources · Scripture quotations are from the King James Version (KJV).</p>
      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((item) => <article key={item.id} className="card flex flex-col gap-3 p-5">
          <div><p className="eyebrow">{item.category}</p><h2 className="mt-2 font-display text-xl">{item.title}</h2><p className="mt-1 text-xs font-semibold text-gold-700 dark:text-gold-400">{item.reference}</p></div>
          <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.body}</p>
          <div className="border-t border-slate-100 pt-3 dark:border-white/10"><button onClick={() => copy(item)} className="btn-secondary !py-2 !text-xs">{copied === item.id ? <Check size={14} /> : <Download size={14} />}{copied === item.id ? 'Copied' : 'Copy and share'}</button></div>
        </article>)}
        {visible.length === 0 && <p className="py-8 text-sm text-slate-500">No resources match this search.</p>}
      </div>
    </div>
  )
}

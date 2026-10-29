import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.hero-flow', (els) => {
    const gsap = window.gsap;

    const REVEAL = {
        spread: 0.8,
        jitter: 0.12,
        sizeLag: 0.12,
        duration: 1.2,
        fromScale: 0,
        fromOpacity: 0,
        ease: 'expo-out',
        seed: 2026
    };

    const MARQUEE = {
        speed: 10,
        direction: 1,
        rampIn: 1.5
    };

    const PULSE = {
        share: 0.5,
        minScale: 0.85,
        minOpacity: 0.85,
        minCycle: 4,
        maxCycle: 6
    };

    const TEXT = {
        delay: 0.2,
        mobileDelay: 0,
        duration: 1.2,
        distance: 32,
        stagger: 0.12,
        ease: 'power2-out'
    };

    const MOBILE_QUERY = '(max-width: 767px)';
    const VIEWBOX = { width: 1376, height: 532 };
    const PERIOD = VIEWBOX.width * 2;
    const EDGE = 30;

    const HEX_ROWS = [[12.6,203.1,8,"#5B183F"],[13.6,107,8,"#5B183F"],[13.7,458.1,4,"#9158E6"],[14,244.1,15,"#5B183F"],[14,287.9,26,"#5B183F"],[14,331.8,26,"#9158E6"],[14,375.7,21,"#5B183F"],[14.6,420.6,11,"#9158E6"],[51.7,450.6,4,"#3A58EF"],[52,233.1,15,"#9158E6"],[52,277,26,"#9158E6"],[52,320.8,26,"#9158E6"],[52,364.7,15,"#3A58EF"],[52.4,411.3,8,"#3A58EF"],[53.3,189.4,4,"#9158E6"],[54,135.7,4,"#9158E6"],[88.4,157.9,4,"#3A58EF"],[88.7,70.9,4,"#3A58EF"],[89.4,115.8,8,"#3A58EF"],[89.4,375.7,11,"#84CCF1"],[89.7,200.7,15,"#3A58EF"],[89.7,244.2,26,"#3A58EF"],[89.7,287.8,26,"#3A58EF"],[89.7,331.3,21,"#84CCF1"],[89.9,422.3,8,"#84CCF1"],[126.8,362.9,11,"#38CA73"],[127.1,190.4,21,"#84CCF1"],[127.1,233.6,26,"#84CCF1"],[127.1,276.8,26,"#38CA73"],[127.1,320,15,"#38CA73"],[127.6,147.4,11,"#84CCF1"],[127.9,446.2,4,"#38CA73"],[128.1,110.2,8,"#84CCF1"],[128.3,62.5,4,"#3A58EF"],[147.1,398.9,4,"#FFDD39"],[164.1,116.8,8,"#38CA73"],[164.2,71.8,4,"#84CCF1"],[164.2,158.8,15,"#38CA73"],[164.2,201.7,26,"#38CA73"],[164.2,244.6,26,"#38CA73"],[164.2,287.4,15,"#FFDD39"],[164.5,332.7,8,"#FFDD39"],[184.4,365.5,8,"#FFDD39"],[200.1,359.7,4,"#FDB84E"],[200.8,321.1,8,"#FFDD39"],[201.1,149,21,"#FFDD39"],[201.1,191.6,26,"#FFDD39"],[201.1,234.1,26,"#FDB84E"],[201.1,276.6,15,"#FDB84E"],[201.4,409.3,4,"#FDB84E"],[202,104.9,8,"#FFDD39"],[202.3,69,8,"#FFDD39"],[236.6,288.5,11,"#FDB84E"],[237,372.9,4,"#FFDD39"],[237.1,325,4,"#FDB84E"],[237.5,73.7,4,"#FFDD39"],[237.6,118.3,15,"#FFDD39"],[237.6,160.5,26,"#FFDD39"],[237.6,202.7,26,"#FFDD39"],[237.6,244.9,15,"#FFDD39"],[238.2,27.7,4,"#FFDD39"],[257.7,384.9,4,"#FDB84E"],[272.7,256.3,11,"#FDB84E"],[272.8,384.6,4,"#FDB84E"],[273,48.7,8,"#FDB84E"],[273.3,85.9,8,"#FDB84E"],[273.9,1.3,4,"#FFDD39"],[273.9,129.9,21,"#FDB84E"],[273.9,171.8,26,"#FFDD39"],[273.9,213.7,21,"#FDB84E"],[274.4,292.3,8,"#FDB84E"],[274.7,333.7,4,"#FDB84E"],[292.9,310.5,4,"#FDB84E"],[308.5,281.1,8,"#FDB84E"],[308.9,39.1,4,"#FDB84E"],[309.9,79.1,15,"#FDB84E"],[309.9,120.6,26,"#FDB84E"],[309.9,162.1,26,"#FDB84E"],[309.9,203.7,21,"#FDB84E"],[310,334.6,4,"#F9A98A"],[310.7,363.8,4,"#FDB84E"],[311.1,245,11,"#FDB84E"],[326.9,325.2,4,"#F9A98A"],[344.6,256.6,4,"#FDB84E"],[345.6,90.9,21,"#FDB84E"],[345.6,132.1,26,"#FDB84E"],[345.6,173.3,26,"#F9A98A"],[345.6,214.5,15,"#FDB84E"],[345.7,295,4,"#FDB84E"],[346.7,336.8,4,"#FDB84E"],[379.5,43.5,11,"#FDB84E"],[381,82,21,"#F9A98A"],[381,122.9,26,"#FDB84E"],[381,163.8,26,"#F9A98A"],[381,204.7,15,"#FDB84E"],[381.6,318.9,4,"#FDB84E"],[381.8,248.2,8,"#FDB84E"],[382.4,282.4,4,"#FDB84E"],[414.8,55.5,8,"#F9A98A"],[414.8,217.8,11,"#F9A98A"],[415,333.7,4,"#F9A98A"],[416.1,93.7,21,"#FDB84E"],[416.1,134.2,26,"#FDB84E"],[416.1,174.8,21,"#F9A98A"],[416.3,301.8,4,"#F9A98A"],[417.1,374.4,4,"#F9A98A"],[417.6,254.9,8,"#F9A98A"],[432,260.9,8,"#F9A98A"],[450.1,25.2,11,"#FDB84E"],[450.3,226.5,11,"#F9A98A"],[450.4,298.7,4,"#F9A98A"],[450.5,339.5,4,"#F9A98A"],[450.9,64.9,15,"#FDB84E"],[450.9,105.1,26,"#F9A98A"],[450.9,145.4,26,"#F9A98A"],[450.9,185.6,21,"#F9A98A"],[451.7,270.9,4,"#F9A98A"],[484.1,215.4,11,"#F9A98A"],[484.6,295.7,4,"#FF696A"],[484.7,54,11,"#F9A98A"],[485,341.3,4,"#FF696A"],[485.4,96.5,21,"#F9A98A"],[485.4,136.4,26,"#F9A98A"],[485.4,176.3,21,"#F9A98A"],[486,6.3,4,"#F9A98A"],[486.9,254.5,8,"#F9A98A"],[503.1,258.7,4,"#F9A98A"],[519.7,68.2,15,"#F9A98A"],[519.7,107.8,21,"#F9A98A"],[519.7,147.3,26,"#F9A98A"],[519.7,186.9,21,"#F9A98A"],[520.6,299.2,4,"#FF696A"],[521.1,30.3,11,"#FF696A"],[521.1,224.2,11,"#FF696A"],[521.1,266.8,8,"#FF696A"],[536.8,274.9,4,"#F9A98A"],[553,236.5,11,"#FF696A"],[553.3,351,4,"#FF696A"],[553.4,275.8,8,"#FF696A"],[553.7,79.7,15,"#FF696A"],[553.7,118.9,21,"#F9A98A"],[553.7,158.1,26,"#F9A98A"],[553.7,197.4,21,"#FF696A"],[553.7,308.5,4,"#FF696A"],[553.9,49.5,8,"#FF696A"],[554,17.7,4,"#F9A98A"],[586.3,265.8,8,"#FF696A"],[587,384.7,4,"#FF696A"],[587.1,69.9,11,"#FF696A"],[587.3,27.1,8,"#FF696A"],[587.3,110.5,21,"#F9A98A"],[587.3,149.3,26,"#FF696A"],[587.3,188.2,26,"#FF696A"],[587.3,227.1,15,"#FF696A"],[587.3,344.9,4,"#FF696A"],[587.7,308.5,4,"#FF696A"],[602.3,350.2,8,"#FF696A"],[620,275.5,11,"#FF696A"],[620.1,82.8,11,"#FF696A"],[620.7,121.4,15,"#FF696A"],[620.7,160,26,"#FF696A"],[620.7,198.5,26,"#FF696A"],[620.7,237.1,15,"#FF696A"],[621.2,40.3,8,"#F9A98A"],[621.2,314.2,8,"#FF696A"],[621.8,388.9,4,"#FF696A"],[622,360.2,4,"#FF696A"],[652.5,341.9,4,"#FF696A"],[653.1,77,8,"#FF696A"],[653.7,306.9,11,"#FF696A"],[653.8,151.3,21,"#FF696A"],[653.8,189.6,26,"#FF696A"],[653.8,227.8,21,"#FF696A"],[653.8,266,15,"#FF696A"],[654.9,41.4,4,"#FF696A"],[655.3,111,11,"#FF696A"],[685.6,123.7,11,"#FF696A"],[686.5,312.5,8,"#FF696A"],[686.5,389.1,4,"#FF696A"],[686.6,161.8,21,"#FF696A"],[686.6,199.7,26,"#FF696A"],[686.6,237.6,21,"#FF696A"],[686.6,275.5,15,"#FF696A"],[687.8,354.3,4,"#FF696A"],[717.9,92.2,8,"#FF696A"],[717.9,134.3,11,"#FF696A"],[718.1,320.1,11,"#FF696A"],[719.2,53.1,4,"#FF696A"],[719.2,172.1,15,"#FF696A"],[719.2,209.7,26,"#FF696A"],[719.2,247.2,26,"#FF696A"],[719.2,284.8,15,"#FF696A"],[720.1,364.2,8,"#FF696A"],[720.6,396.1,4,"#FF696A"],[734.8,101.6,8,"#FF696A"],[737.3,366.3,4,"#FF696A"],[750.5,349.1,11,"#FF696A"],[751.4,200.9,15,"#FF696A"],[751.4,238.1,26,"#FF696A"],[751.4,275.3,21,"#FF696A"],[751.4,312.5,15,"#FF696A"],[751.5,161.9,11,"#FF696A"],[751.8,389.5,8,"#FF696A"],[752.1,84.4,4,"#FF696A"],[769.3,122.3,8,"#FF696A"],[783.2,356.1,11,"#FF696A"],[783.4,210.7,15,"#FF696A"],[783.4,247.6,21,"#FF696A"],[783.4,284.4,26,"#FF696A"],[783.4,321.3,21,"#FF696A"],[784.3,132.1,11,"#FF696A"],[784.4,428.3,4,"#FF696A"],[784.7,101.4,4,"#FF696A"],[784.8,171.4,11,"#FF696A"],[798.8,143.1,4,"#FF696A"],[813.8,145.4,8,"#FF696A"],[813.9,403.4,8,"#FF696A"],[815,220.3,15,"#FF696A"],[815,256.9,21,"#FF696A"],[815,293.4,26,"#FF696A"],[815,330,21,"#FF696A"],[816,182.7,4,"#FF696A"],[816.1,366.2,11,"#FF696A"],[829.3,148.7,4,"#FF696A"],[830.6,424.6,4,"#FF696A"],[845,137,4,"#FF696A"],[845,390.6,8,"#FF696A"],[845.3,174.6,11,"#FF696A"],[846,214.1,8,"#FF696A"],[846.4,247.9,15,"#FF696A"],[846.4,284.1,21,"#FF696A"],[846.4,320.3,26,"#FF696A"],[846.4,356.6,21,"#FF696A"],[876.1,470.3,4,"#FF696A"],[877.5,257,15,"#FF696A"],[877.5,292.9,21,"#FF696A"],[877.5,328.8,26,"#FF696A"],[877.5,364.7,21,"#FF696A"],[877.5,400.6,15,"#FF696A"],[877.7,438.9,4,"#FF696A"],[878,153.1,4,"#FF696A"],[878.3,221.8,11,"#FF696A"],[878.4,120.8,4,"#FF696A"],[891.6,186.8,4,"#FF696A"],[894.8,483.3,4,"#FF696A"],[907.4,155.1,4,"#FF696A"],[907.8,229.8,8,"#FF696A"],[908.3,301.6,21,"#FF696A"],[908.3,337.1,26,"#FF696A"],[908.3,372.7,21,"#FF696A"],[908.3,408.3,15,"#FF696A"],[908.4,266.5,11,"#FF696A"],[909.1,446.2,4,"#FF696A"],[909.6,128.7,4,"#FF696A"],[909.6,202.4,4,"#FF696A"],[922.5,226.6,4,"#FF696A"],[938.4,465.7,4,"#FF696A"],[938.5,432.7,8,"#FF696A"],[938.8,292.4,15,"#FF696A"],[938.8,327.7,21,"#FF696A"],[938.8,362.9,26,"#FF696A"],[938.8,398.1,21,"#FF696A"],[938.9,183,4,"#FF696A"],[939.2,224.4,8,"#FF696A"],[940.2,255,8,"#FF696A"],[953.6,183.1,8,"#FF696A"],[954.4,248.4,8,"#FF696A"],[954.8,485.4,4,"#FF696A"],[967.6,261.9,11,"#FF696A"],[967.7,299.1,11,"#FF696A"],[968,161,4,"#FF696A"],[968.6,191.1,4,"#FF696A"],[969,335.8,21,"#FF696A"],[969,370.7,21,"#FF696A"],[969,405.6,21,"#FF696A"],[969,440.5,15,"#FF696A"],[969,473.5,8,"#FF696A"],[983.5,249.7,4,"#FF696A"],[985.2,273.7,8,"#FF696A"],[997.6,480.6,8,"#FF696A"],[998.1,233.9,4,"#FF696A"],[998.4,172.6,4,"#FF696A"],[998.4,309.4,11,"#FF696A"],[999,271.5,8,"#FF696A"],[999,343.8,21,"#FF696A"],[999,378.4,21,"#FF696A"],[999,412.9,21,"#FF696A"],[999,447.5,15,"#FF696A"],[999.2,212.4,4,"#FF696A"],[999.5,143.5,4,"#FF696A"],[1013.9,212.1,4,"#FF696A"],[1014.4,500.3,8,"#FF696A"],[1015.2,227.5,8,"#FF696A"],[1027.7,469.3,11,"#FF696A"],[1027.8,198.9,8,"#FF696A"],[1028.6,334.5,15,"#FF696A"],[1028.6,368.7,21,"#FF696A"],[1028.6,403,21,"#FF696A"],[1028.6,437.2,21,"#FF696A"],[1029.8,500.8,8,"#FF696A"],[1029.9,235.1,8,"#FF696A"],[1029.9,299.5,8,"#FF696A"],[1030.1,265.4,8,"#FF696A"],[1057.5,174.7,4,"#FF696A"],[1057.5,477.6,11,"#FF696A"],[1057.8,507.3,8,"#FF696A"],[1058,308.3,8,"#FF696A"],[1058,342.3,15,"#FF696A"],[1058,376.2,21,"#FF696A"],[1058,410.1,21,"#FF696A"],[1058,444,15,"#FF696A"],[1058.3,205.1,8,"#FF696A"],[1058.6,245.9,4,"#FF696A"],[1058.6,277.9,4,"#FF696A"],[1072.3,249.9,4,"#FF696A"],[1086,244,4,"#FF696A"],[1086.1,181.9,4,"#FF696A"],[1086.4,517.5,8,"#FF696A"],[1087.1,349.9,15,"#FF696A"],[1087.1,383.5,21,"#FF696A"],[1087.1,417.1,21,"#FF696A"],[1087.1,450.7,15,"#FF696A"],[1087.5,483.5,8,"#FF696A"],[1087.8,278.5,4,"#FF696A"],[1087.9,222.1,4,"#FF696A"],[1088.1,145.9,4,"#FF696A"],[1088.3,318.1,11,"#FF696A"],[1101.5,222.9,8,"#FF696A"],[1114.5,241.9,4,"#FF696A"],[1114.6,510.6,8,"#FF696A"],[1115.8,340.8,15,"#FF696A"],[1115.8,374,21,"#FF696A"],[1115.8,407.3,21,"#FF696A"],[1115.8,440.5,21,"#FF696A"],[1116.5,207,4,"#FF696A"],[1116.8,473.8,11,"#FF696A"],[1117.3,270.7,11,"#FF696A"],[1117.3,309.5,11,"#FF696A"],[1130.7,246.9,8,"#FF696A"],[1131.3,217.4,4,"#FF696A"],[1143.1,190.2,4,"#FF696A"],[1143.6,510.4,8,"#FF696A"],[1143.7,250.5,4,"#FF696A"],[1144.3,348.3,15,"#FF696A"],[1144.3,381.2,21,"#FF696A"],[1144.3,414.1,21,"#FF696A"],[1144.3,447,15,"#FF696A"],[1144.3,479.4,11,"#FF696A"],[1144.5,278.9,8,"#FF696A"],[1144.9,314.4,11,"#FF696A"],[1145.7,223.2,4,"#FF696A"],[1171.4,516.1,8,"#FF696A"],[1171.7,228.7,4,"#FF696A"],[1171.9,323,11,"#FF696A"],[1172.2,259.5,8,"#FF696A"],[1172.6,355.6,21,"#FF696A"],[1172.6,388.2,21,"#FF696A"],[1172.6,420.7,21,"#FF696A"],[1172.6,453.3,15,"#FF696A"],[1173,209.7,4,"#FF696A"],[1173,488.1,11,"#FF696A"],[1173.2,287,8,"#FF696A"],[1187.7,295.1,4,"#FF696A"],[1199.4,506.5,8,"#FF696A"],[1199.5,218.7,8,"#FF696A"],[1200.1,256.4,4,"#FF696A"],[1200.5,346.6,21,"#FF696A"],[1200.5,378.9,21,"#FF696A"],[1200.5,411.1,21,"#FF696A"],[1200.5,443.4,15,"#FF696A"],[1200.7,183.7,4,"#FF696A"],[1201.2,473.3,11,"#FF696A"],[1201.4,294.5,8,"#FF696A"],[1201.9,316.5,8,"#FF696A"],[1213.5,264.8,8,"#FF696A"],[1227.2,478.3,11,"#FF696A"],[1227.5,157.7,4,"#FF696A"],[1227.7,289.8,11,"#FF696A"],[1227.7,448.1,11,"#F48698"],[1227.9,260.3,11,"#FF696A"],[1228.1,321.8,15,"#FF696A"],[1228.1,353.8,21,"#FF696A"],[1228.1,385.7,21,"#FF696A"],[1228.1,417.6,21,"#FF696A"],[1228.8,189,8,"#FF696A"],[1228.9,227.6,8,"#FF696A"],[1241,464.8,8,"#FF696A"],[1242,250.1,4,"#FF696A"],[1255.3,457.1,11,"#F48698"],[1255.4,487.4,8,"#FF696A"],[1255.5,329.2,15,"#FF696A"],[1255.5,360.7,21,"#FF696A"],[1255.5,392.3,21,"#FF696A"],[1255.5,423.9,15,"#FF696A"],[1255.7,298.2,11,"#FF696A"],[1256.6,133.1,4,"#FF696A"],[1256.6,199,4,"#FF696A"],[1256.6,232.7,4,"#FF696A"],[1256.6,269.8,8,"#FF696A"],[1256.7,169.9,4,"#FF696A"],[1269.6,472,4,"#FF696A"],[1281.1,445.3,11,"#F48698"],[1281.4,171.3,4,"#FF696A"],[1281.4,513,4,"#F48698"],[1281.5,258.3,4,"#FF696A"],[1281.6,148.7,4,"#FF696A"],[1281.8,193.9,4,"#FF696A"],[1282.5,320.7,21,"#FF696A"],[1282.5,351.9,21,"#F48698"],[1282.5,383.2,21,"#FF696A"],[1282.5,414.4,15,"#F48698"],[1282.7,481.3,8,"#F48698"],[1283.3,291.4,8,"#FF696A"],[1283.7,231.9,8,"#FF696A"],[1307.8,234.1,11,"#FF696A"],[1308.1,145,4,"#F48698"],[1308.1,449.7,4,"#F48698"],[1309.3,296.9,15,"#FF696A"],[1309.3,327.8,21,"#FF696A"],[1309.3,358.8,21,"#FF696A"],[1309.3,389.7,15,"#FF696A"],[1309.5,177.7,4,"#F48698"],[1310,438.5,8,"#FF696A"],[1310.1,421.5,11,"#F48698"],[1310.3,209.5,4,"#F48698"],[1310.3,266.3,11,"#F48698"],[1334.6,212,8,"#F48698"],[1335.2,185.6,4,"#F48698"],[1335.2,241.8,8,"#F48698"],[1335.8,273.6,15,"#F48698"],[1335.8,304.2,21,"#F48698"],[1335.8,334.8,21,"#F48698"],[1335.8,365.4,21,"#F48698"],[1335.8,396,15,"#F48698"],[1336,424.5,8,"#F48698"],[1336,441.5,8,"#F48698"],[1336,455.7,4,"#F48698"],[1336.1,157.8,4,"#FF696A"],[1348.8,210.4,8,"#FF696A"],[1361.7,205.9,4,"#F48698"],[1361.8,146.1,4,"#F48698"],[1362,266,15,"#F48698"],[1362,296.3,21,"#F48698"],[1362,326.5,21,"#F48698"],[1362,356.8,21,"#F48698"],[1362.1,119.2,4,"#F48698"],[1362.3,173.9,4,"#F48698"],[1362.7,233.8,11,"#F48698"],[1363,444.1,4,"#F48698"],[1363,422.9,8,"#F48698"],[1363,481.7,4,"#F48698"],[1363.5,387.2,11,"#F48698"]];

    const script = () => {
        els.forEach(self => {
            handleText(self);
            handleMedia(self);
        });
    };

    const handleText = (self) => {
        const items = self.querySelectorAll('.hf-content > *');
        if (!items.length) return;

        if (!gsap) {
            items.forEach(item => item.style.cssText += 'opacity: 1; visibility: visible;');
            return;
        }

        gsap.fromTo(items,
            { autoAlpha: 0, y: TEXT.distance },
            { autoAlpha: 1, y: 0, duration: TEXT.duration, delay: window.matchMedia(MOBILE_QUERY).matches ? TEXT.mobileDelay : TEXT.delay, stagger: TEXT.stagger, ease: TEXT.ease }
        );
    };

    const handleMedia = (self) => {
        const wrapper = self.querySelector('.hf-wave');
        const canvas = wrapper?.querySelector('canvas');
        if (!canvas || !gsap) return;

        createWave(wrapper, canvas);
    };

    const createWave = (wrapper, canvas) => {
        const context = canvas.getContext('2d');
        const hexes = getHexes();
        const marquee = { offset: 0, strength: 0 };

        let pixelRatio = 1;
        let size = { width: 0, height: 0 };
        let graphic = { x: 0, y: 0, scale: 1 };
        const growEase = gsap.parseEase(REVEAL.ease);
        const fadeEase = gsap.parseEase('power1.out');
        const waveEase = gsap.parseEase('sine.inOut');
        const fadeDuration = Math.max(0.1, REVEAL.duration * 0.5);

        let loadTime = 0;
        let loadEnd = 0;
        let pulseTime = 0;
        let isIdle = false;
        let isRunning = false;

        const resize = () => {
            const box = canvas.getBoundingClientRect();
            const art = wrapper.getBoundingClientRect();

            pixelRatio = Math.min(2, window.devicePixelRatio || 1);
            size = { width: box.width, height: box.height };
            canvas.width = Math.round(box.width * pixelRatio);
            canvas.height = Math.round(box.height * pixelRatio);

            graphic = {
                scale: art.width / VIEWBOX.width,
                x: art.left - box.left,
                y: art.top - box.top
            };

            render();
        };

        const prepare = () => {
            setDelays(hexes);
            loadEnd = Math.max(...hexes.map(hex => hex.delay + Math.max(REVEAL.duration, fadeDuration)));

            const random = createRandom(REVEAL.seed + 1);

            hexes.forEach(hex => {
                hex.pulses = random() <= PULSE.share;
                if (!hex.pulses) return;

                hex.cycle = PULSE.minCycle + random() * (PULSE.maxCycle - PULSE.minCycle);
                hex.offset = random() * PULSE.maxCycle;
            });
        };

        const updateLoad = () => {
            hexes.forEach(hex => {
                hex.scale = REVEAL.fromScale + (1 - REVEAL.fromScale) * growEase(clamp((loadTime - hex.delay) / REVEAL.duration, 0, 1));
                hex.opacity = REVEAL.fromOpacity + (1 - REVEAL.fromOpacity) * fadeEase(clamp((loadTime - hex.delay) / fadeDuration, 0, 1));
            });
        };

        const updatePulse = () => {
            hexes.forEach(hex => {
                if (!hex.pulses) return;

                const local = pulseTime - hex.offset;
                if (local < 0) return;

                const phase = (local % hex.cycle) / (hex.cycle / 2);
                hex.pulse = waveEase(phase <= 1 ? phase : 2 - phase);
            });
        };

        const tick = (time, deltaTime) => {
            const delta = Math.min(deltaTime, 100) / 1000;
            loadTime += delta;

            marquee.strength = waveEase(clamp(loadTime / MARQUEE.rampIn, 0, 1));
            marquee.offset = (marquee.offset + MARQUEE.direction * MARQUEE.speed * marquee.strength * delta) % PERIOD;

            if (isIdle) {
                pulseTime += delta;
                updatePulse();
            } else {
                updateLoad();
                if (loadTime >= loadEnd) isIdle = true;
            }

            render();
        };

        const start = () => {
            if (isRunning) return;
            isRunning = true;
            gsap.ticker.add(tick);
        };

        const stop = () => {
            if (!isRunning) return;
            isRunning = false;
            gsap.ticker.remove(tick);
        };

        prepare();

        const drawHex = (x, y, radius, color, opacity) => {
            context.globalAlpha = clamp(opacity, 0, 1);
            context.fillStyle = color;
            context.beginPath();

            for (let corner = 0; corner < 6; corner++) {
                const angle = corner * Math.PI / 3;
                const cornerX = x + radius * Math.cos(angle);
                const cornerY = y + radius * Math.sin(angle);

                if (corner === 0) context.moveTo(cornerX, cornerY);
                else context.lineTo(cornerX, cornerY);
            }

            context.closePath();
            context.fill();
        };

        const drawCopies = (hex, baseX, radius, screenY, minX, maxX) => {
            const startX = baseX + marquee.offset;
            const first = Math.ceil((minX - startX) / PERIOD);
            const last = Math.floor((maxX - startX) / PERIOD);

            for (let copy = first; copy <= last; copy++) {
                const screenX = graphic.x + (startX + copy * PERIOD) * graphic.scale;
                drawHex(screenX, screenY, radius, hex.color, hex.opacity * (1 - hex.pulse * (1 - PULSE.minOpacity)));
            }
        };

        const render = () => {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            const minX = -graphic.x / graphic.scale - EDGE;
            const maxX = (size.width - graphic.x) / graphic.scale + EDGE;

            hexes.forEach(hex => {
                const isHidden = hex.scale <= 0.002 || hex.opacity <= 0.002;
                if (isHidden) return;

                const radius = hex.radius * graphic.scale * hex.scale * (1 - hex.pulse * (1 - PULSE.minScale));
                if (radius < 0.2) return;

                const screenY = graphic.y + hex.y * graphic.scale;

                drawCopies(hex, hex.x, radius, screenY, minX, maxX);
                drawCopies(hex, PERIOD - hex.x, radius, screenY, minX, maxX);
            });

            context.globalAlpha = 1;
        };

        new ResizeObserver(resize).observe(canvas);

        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) start();
            else stop();
        }, { threshold: 0.05 }).observe(wrapper);
    };

    const setDelays = (hexes) => {
        const random = createRandom(REVEAL.seed);
        const xs = hexes.map(hex => hex.x);
        const min = Math.min(...xs);
        const range = (Math.max(...xs) - min) || 1;

        hexes.forEach(hex => {
            const progress = (hex.x - min) / range;

            hex.delay = REVEAL.spread * progress
                + REVEAL.jitter * random()
                + REVEAL.sizeLag * (1 - hex.sizeRatio);
        });
    };

    const getHexes = () => {
        const hexes = HEX_ROWS.map(([x, y, size, color]) => ({
            x,
            y,
            radius: size / 2,
            color,
            scale: 0,
            opacity: 0,
            pulse: 0,
            delay: 0
        }));

        const radii = hexes.map(hex => hex.radius);
        const smallest = Math.min(...radii);
        const largest = Math.max(...radii);

        hexes.forEach(hex => {
            hex.sizeRatio = (hex.radius - smallest) / (largest - smallest);
        });

        return hexes;
    };

    const createRandom = (seed) => {
        let state = seed;

        return () => {
            state |= 0;
            state = state + 0x6D2B79F5 | 0;
            let value = Math.imul(state ^ state >>> 15, 1 | state);
            value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
            return ((value ^ value >>> 14) >>> 0) / 4294967296;
        };
    };

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    script();
});

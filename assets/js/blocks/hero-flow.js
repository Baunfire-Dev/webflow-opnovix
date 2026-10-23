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
        duration: 1.2,
        distance: 32,
        stagger: 0.12,
        ease: 'power2-out'
    };

    const VIEWBOX = { width: 1376, height: 532 };
    const PERIOD = VIEWBOX.width * 2;
    const EDGE = 30;

    const HEX_ROWS = [[12.6,203.1,8,"#982952"],[13.6,107,8,"#972B53"],[13.7,458.1,4,"#F27281"],[14,244.1,15,"#962453"],[14,287.9,26,"#95214E"],[14,331.8,26,"#972450"],[14,375.7,21,"#93224D"],[14.6,420.6,11,"#B0315D"],[51.7,450.6,4,"#A02C5D"],[52,233.1,15,"#972452"],[52,277,26,"#93234E"],[52,320.8,26,"#94254F"],[52,364.7,15,"#93254F"],[52.4,411.3,8,"#9C2C56"],[53.3,189.4,4,"#9C2C61"],[54,135.7,4,"#9A2659"],[88.4,157.9,4,"#EC6872"],[88.7,70.9,4,"#EA6F75"],[89.4,115.8,8,"#9C2351"],[89.4,375.7,11,"#FA7779"],[89.7,200.7,15,"#FD8B7A"],[89.7,244.2,26,"#FF9A7E"],[89.7,287.8,26,"#FC9677"],[89.7,331.3,21,"#FB9579"],[89.9,422.3,8,"#9D2A54"],[126.8,362.9,11,"#F6A386"],[127.1,190.4,21,"#FFA184"],[127.1,233.6,26,"#FE9F7C"],[127.1,276.8,26,"#FDA47E"],[127.1,320,15,"#FC9E7B"],[127.6,147.4,11,"#F79380"],[127.9,446.2,4,"#F49883"],[128.1,110.2,8,"#F49F8B"],[128.3,62.5,4,"#EF6177"],[147.1,398.9,4,"#FFC0A7"],[164.1,116.8,8,"#ED9183"],[164.2,71.8,4,"#F49682"],[164.2,158.8,15,"#FD9C80"],[164.2,201.7,26,"#FBA67C"],[164.2,244.6,26,"#FFA779"],[164.2,287.4,15,"#F9A779"],[164.5,332.7,8,"#F2AD91"],[184.4,365.5,8,"#FBB481"],[200.1,359.7,4,"#FBC281"],[200.8,321.1,8,"#F4B279"],[201.1,149,21,"#F9A67A"],[201.1,191.6,26,"#FAA973"],[201.1,234.1,26,"#FBAD6D"],[201.1,276.6,15,"#FBB171"],[201.4,409.3,4,"#F8B86E"],[202,104.9,8,"#FBA589"],[202.3,69,8,"#FA9F82"],[236.6,288.5,11,"#F9BC68"],[237,372.9,4,"#F9CB7A"],[237.1,325,4,"#FFCD75"],[237.5,73.7,4,"#FFC07D"],[237.6,118.3,15,"#F9AE75"],[237.6,160.5,26,"#FDAF6C"],[237.6,202.7,26,"#FEB45B"],[237.6,244.9,15,"#F6B76A"],[238.2,27.7,4,"#F28882"],[257.7,384.9,4,"#EEAE57"],[272.7,256.3,11,"#FDBC56"],[272.8,384.6,4,"#F9C76A"],[273,48.7,8,"#F6B978"],[273.3,85.9,8,"#F7B469"],[273.9,1.3,4,"#FFCF71"],[273.9,129.9,21,"#FDB964"],[273.9,171.8,26,"#FEB356"],[273.9,213.7,21,"#FDB757"],[274.4,292.3,8,"#F5C268"],[274.7,333.7,4,"#FDCD6B"],[292.9,310.5,4,"#F4C167"],[308.5,281.1,8,"#EEB96A"],[308.9,39.1,4,"#F5B366"],[309.9,79.1,15,"#FDB659"],[309.9,120.6,26,"#FFB95B"],[309.9,162.1,26,"#FFB958"],[309.9,203.7,21,"#FDB453"],[310,334.6,4,"#FAC265"],[310.7,363.8,4,"#F6C261"],[311.1,245,11,"#FBBC52"],[326.9,325.2,4,"#F3C75B"],[344.6,256.6,4,"#FCCE6F"],[345.6,90.9,21,"#FEB95A"],[345.6,132.1,26,"#FFB756"],[345.6,173.3,26,"#FDB24D"],[345.6,214.5,15,"#FFB956"],[345.7,295,4,"#F4BC5E"],[346.7,336.8,4,"#FEC658"],[379.5,43.5,11,"#F9B859"],[381,82,21,"#FFB859"],[381,122.9,26,"#FFB654"],[381,163.8,26,"#FDB354"],[381,204.7,15,"#FDB64F"],[381.6,318.9,4,"#F7C460"],[381.8,248.2,8,"#F8BE5D"],[382.4,282.4,4,"#F2C868"],[414.8,55.5,8,"#F9BA59"],[414.8,217.8,11,"#F6B457"],[415,333.7,4,"#F9BB5D"],[416.1,93.7,21,"#FFB754"],[416.1,134.2,26,"#FFB858"],[416.1,174.8,21,"#FFB751"],[416.3,301.8,4,"#F7C66A"],[417.1,374.4,4,"#FFD670"],[417.6,254.9,8,"#FABC52"],[432,260.9,8,"#FBC057"],[450.1,25.2,11,"#F7BD5F"],[450.3,226.5,11,"#F7BB5C"],[450.4,298.7,4,"#F9CA6B"],[450.5,339.5,4,"#FBBC5B"],[450.9,64.9,15,"#FBB756"],[450.9,105.1,26,"#FFB95A"],[450.9,145.4,26,"#FCB353"],[450.9,185.6,21,"#FFBA5B"],[451.7,270.9,4,"#F5BD65"],[484.1,215.4,11,"#FABD58"],[484.6,295.7,4,"#F3C76F"],[484.7,54,11,"#FEBD59"],[485,341.3,4,"#FACA62"],[485.4,96.5,21,"#F8B354"],[485.4,136.4,26,"#FEB657"],[485.4,176.3,21,"#FFB859"],[486,6.3,4,"#FFD171"],[486.9,254.5,8,"#F7BF5E"],[503.1,258.7,4,"#A47A42"],[519.7,68.2,15,"#FDB352"],[519.7,107.8,21,"#FAB75F"],[519.7,147.3,26,"#FFB85C"],[519.7,186.9,21,"#FCB656"],[520.6,299.2,4,"#FBD06D"],[521.1,30.3,11,"#FDBC5E"],[521.1,224.2,11,"#FEBC5A"],[521.1,266.8,8,"#F3BC67"],[536.8,274.9,4,"#FDC76A"],[553,236.5,11,"#FBC068"],[553.3,351,4,"#F3BF62"],[553.4,275.8,8,"#F0B863"],[553.7,79.7,15,"#F8B75F"],[553.7,118.9,21,"#FFB456"],[553.7,158.1,26,"#FFB45F"],[553.7,197.4,21,"#FEB75D"],[553.7,308.5,4,"#F5BD67"],[553.9,49.5,8,"#F3BD79"],[554,17.7,4,"#FCCA6D"],[586.3,265.8,8,"#F1BA74"],[587,384.7,4,"#E3AC65"],[587.1,69.9,11,"#FCB972"],[587.3,27.1,8,"#F6B86A"],[587.3,110.5,21,"#FCB86A"],[587.3,149.3,26,"#FEB56D"],[587.3,188.2,26,"#FCBC6D"],[587.3,227.1,15,"#FFB765"],[587.3,344.9,4,"#FFCD74"],[587.7,308.5,4,"#F9CB7D"],[602.3,350.2,8,"#F7B45C"],[620,275.5,11,"#F8BB77"],[620.1,82.8,11,"#FAB378"],[620.7,121.4,15,"#FEB06D"],[620.7,160,26,"#FDB17D"],[620.7,198.5,26,"#FEAD73"],[620.7,237.1,15,"#F8B379"],[621.2,40.3,8,"#F9B67D"],[621.2,314.2,8,"#F8B974"],[621.8,388.9,4,"#F5B576"],[622,360.2,4,"#F5B771"],[652.5,341.9,4,"#FFB57D"],[653.1,77,8,"#F7B28B"],[653.7,306.9,11,"#F6B582"],[653.8,151.3,21,"#FFAB7C"],[653.8,189.6,26,"#FBB186"],[653.8,227.8,21,"#FEAF7C"],[653.8,266,15,"#FDAD76"],[654.9,41.4,4,"#F7B37F"],[655.3,111,11,"#FEB184"],[685.6,123.7,11,"#FBAF8A"],[686.5,312.5,8,"#FAAC7E"],[686.5,389.1,4,"#FFC69A"],[686.6,161.8,21,"#FEA886"],[686.6,199.7,26,"#FEA07D"],[686.6,237.6,21,"#FAA985"],[686.6,275.5,15,"#F9AC86"],[687.8,354.3,4,"#F9A984"],[717.9,92.2,8,"#FBAB8C"],[717.9,134.3,11,"#FBA07D"],[718.1,320.1,11,"#F2A587"],[719.2,53.1,4,"#F39683"],[719.2,172.1,15,"#FBA080"],[719.2,209.7,26,"#FD9A79"],[719.2,247.2,26,"#FE9E7F"],[719.2,284.8,15,"#F89F7E"],[720.1,364.2,8,"#F69D7C"],[720.6,396.1,4,"#FB9D85"],[734.8,101.6,8,"#F9A987"],[737.3,366.3,4,"#FFB691"],[750.5,349.1,11,"#F2A78B"],[751.4,200.9,15,"#FD9B7D"],[751.4,238.1,26,"#FF9676"],[751.4,275.3,21,"#FEA082"],[751.4,312.5,15,"#FAA184"],[751.5,161.9,11,"#FAA689"],[751.8,389.5,8,"#F4A38B"],[752.1,84.4,4,"#F59C82"],[769.3,122.3,8,"#EFA58B"],[783.2,356.1,11,"#F99F81"],[783.4,210.7,15,"#FD9477"],[783.4,247.6,21,"#FC967C"],[783.4,284.4,26,"#FD9277"],[783.4,321.3,21,"#FF9A7B"],[784.3,132.1,11,"#F4977F"],[784.4,428.3,4,"#F79585"],[784.7,101.4,4,"#F99D8A"],[784.8,171.4,11,"#F79B82"],[798.8,143.1,4,"#FFAA9B"],[813.8,145.4,8,"#F3917B"],[813.9,403.4,8,"#F48471"],[815,220.3,15,"#FE9174"],[815,256.9,21,"#FA8A70"],[815,293.4,26,"#FA8D74"],[815,330,21,"#F88E75"],[816,182.7,4,"#F69A81"],[816.1,366.2,11,"#F8907D"],[829.3,148.7,4,"#F7A591"],[830.6,424.6,4,"#FFA08A"],[845,137,4,"#FFA091"],[845,390.6,8,"#FB8372"],[845.3,174.6,11,"#F69482"],[846,214.1,8,"#F79480"],[846.4,247.9,15,"#FB8874"],[846.4,284.1,21,"#FF8C79"],[846.4,320.3,26,"#FE907A"],[846.4,356.6,21,"#FB8974"],[876.1,470.3,4,"#F98E80"],[877.5,257,15,"#FB8B77"],[877.5,292.9,21,"#F88070"],[877.5,328.8,26,"#FC7B6D"],[877.5,364.7,21,"#FD8575"],[877.5,400.6,15,"#FA796E"],[877.7,438.9,4,"#ED7E7D"],[878,153.1,4,"#FCA696"],[878.3,221.8,11,"#F39380"],[878.4,120.8,4,"#F58C84"],[891.6,186.8,4,"#F3938B"],[894.8,483.3,4,"#F38877"],[907.4,155.1,4,"#FC9781"],[907.8,229.8,8,"#F6917F"],[908.3,301.6,21,"#FB7D6F"],[908.3,337.1,26,"#FC766C"],[908.3,372.7,21,"#F18074"],[908.3,408.3,15,"#FA8074"],[908.4,266.5,11,"#F58E7C"],[909.1,446.2,4,"#FF978D"],[909.6,128.7,4,"#FFA292"],[909.6,202.4,4,"#FBA191"],[922.5,226.6,4,"#F38B86"],[938.4,465.7,4,"#F99C98"],[938.5,432.7,8,"#FB887D"],[938.8,292.4,15,"#F58A82"],[938.8,327.7,21,"#F8857B"],[938.8,362.9,26,"#FD786D"],[938.8,398.1,21,"#FE7B6F"],[938.9,183,4,"#F79890"],[939.2,224.4,8,"#F68F80"],[940.2,255,8,"#F28678"],[953.6,183.1,8,"#FB9683"],[954.4,248.4,8,"#F59181"],[954.8,485.4,4,"#FA8981"],[967.6,261.9,11,"#FB8377"],[967.7,299.1,11,"#F88276"],[968,161,4,"#F9978A"],[968.6,191.1,4,"#F99789"],[969,335.8,21,"#FF776E"],[969,370.7,21,"#FC796D"],[969,405.6,21,"#FC7D73"],[969,440.5,15,"#F9877E"],[969,473.5,8,"#F9857C"],[983.5,249.7,4,"#F3837E"],[985.2,273.7,8,"#F69381"],[997.6,480.6,8,"#F17E75"],[998.1,233.9,4,"#F08983"],[998.4,172.6,4,"#FF8E7F"],[998.4,309.4,11,"#F78378"],[999,271.5,8,"#F88573"],[999,343.8,21,"#FE766C"],[999,378.4,21,"#FE7A70"],[999,412.9,21,"#FD6D63"],[999,447.5,15,"#F97C71"],[999.2,212.4,4,"#FF9991"],[999.5,143.5,4,"#F87C71"],[1013.9,212.1,4,"#FD957E"],[1014.4,500.3,8,"#F77B71"],[1015.2,227.5,8,"#F58F82"],[1027.7,469.3,11,"#FC8075"],[1027.8,198.9,8,"#F78A7D"],[1028.6,334.5,15,"#EF8982"],[1028.6,368.7,21,"#FB7169"],[1028.6,403,21,"#FF877F"],[1028.6,437.2,21,"#FA756B"],[1029.8,500.8,8,"#EE7D75"],[1029.9,235.1,8,"#F48D84"],[1029.9,299.5,8,"#F4857E"],[1030.1,265.4,8,"#F0958A"],[1057.5,174.7,4,"#FF9086"],[1057.5,477.6,11,"#F87C75"],[1057.8,507.3,8,"#F5827F"],[1058,308.3,8,"#F68579"],[1058,342.3,15,"#FD8479"],[1058,376.2,21,"#F8695E"],[1058,410.1,21,"#FC756A"],[1058,444,15,"#FD766E"],[1058.3,205.1,8,"#F38680"],[1058.6,245.9,4,"#F4867A"],[1058.6,277.9,4,"#FFA49C"],[1072.3,249.9,4,"#F9958D"],[1086,244,4,"#F48A7D"],[1086.1,181.9,4,"#F07A6E"],[1086.4,517.5,8,"#FA7D71"],[1087.1,349.9,15,"#FB6F65"],[1087.1,383.5,21,"#F77A72"],[1087.1,417.1,21,"#FC756C"],[1087.1,450.7,15,"#FA7C73"],[1087.5,483.5,8,"#E77F7A"],[1087.8,278.5,4,"#FF9485"],[1087.9,222.1,4,"#EE7B73"],[1088.1,145.9,4,"#F87C7A"],[1088.3,318.1,11,"#FA877E"],[1101.5,222.9,8,"#F78A81"],[1114.5,241.9,4,"#F8857E"],[1114.6,510.6,8,"#ED827B"],[1115.8,340.8,15,"#F48C81"],[1115.8,374,21,"#F76F68"],[1115.8,407.3,21,"#FF7B72"],[1115.8,440.5,21,"#FF716A"],[1116.5,207,4,"#F7908C"],[1116.8,473.8,11,"#EF857E"],[1117.3,270.7,11,"#FB8175"],[1117.3,309.5,11,"#FA867D"],[1130.7,246.9,8,"#FA8A7A"],[1131.3,217.4,4,"#ED8885"],[1143.1,190.2,4,"#F88A8A"],[1143.6,510.4,8,"#F27B73"],[1143.7,250.5,4,"#FF938C"],[1144.3,348.3,15,"#FB847A"],[1144.3,381.2,21,"#F87E75"],[1144.3,414.1,21,"#FB7C72"],[1144.3,447,15,"#FB8378"],[1144.3,479.4,11,"#FB7E76"],[1144.5,278.9,8,"#F38A7E"],[1144.9,314.4,11,"#FB8379"],[1145.7,223.2,4,"#ED8A7C"],[1171.4,516.1,8,"#EE837A"],[1171.7,228.7,4,"#F78877"],[1171.9,323,11,"#F98076"],[1172.2,259.5,8,"#F68175"],[1172.6,355.6,21,"#FD7169"],[1172.6,388.2,21,"#FC756C"],[1172.6,420.7,21,"#FC6D65"],[1172.6,453.3,15,"#FE786E"],[1173,209.7,4,"#FC9481"],[1173,488.1,11,"#F77A73"],[1173.2,287,8,"#F98577"],[1187.7,295.1,4,"#FA948E"],[1199.4,506.5,8,"#FB8276"],[1199.5,218.7,8,"#FA857A"],[1200.1,256.4,4,"#FF9588"],[1200.5,346.6,21,"#FE756C"],[1200.5,378.9,21,"#F57D74"],[1200.5,411.1,21,"#FD796F"],[1200.5,443.4,15,"#FE7A70"],[1200.7,183.7,4,"#FD9183"],[1201.2,473.3,11,"#FD756F"],[1201.4,294.5,8,"#F78375"],[1201.9,316.5,8,"#F18981"],[1213.5,264.8,8,"#F39488"],[1227.2,478.3,11,"#FB7F75"],[1227.5,157.7,4,"#F28F8F"],[1227.7,289.8,11,"#FD786E"],[1227.7,448.1,11,"#F77F77"],[1227.9,260.3,11,"#FA8178"],[1228.1,321.8,15,"#FE7A70"],[1228.1,353.8,21,"#FE7D73"],[1228.1,385.7,21,"#FF7E74"],[1228.1,417.6,21,"#FE766D"],[1228.8,189,8,"#EE8C84"],[1228.9,227.6,8,"#F48A80"],[1241,464.8,8,"#EE847F"],[1242,250.1,4,"#F58789"],[1255.3,457.1,11,"#F88E84"],[1255.4,487.4,8,"#F2867E"],[1255.5,329.2,15,"#FE8076"],[1255.5,360.7,21,"#FE7C6F"],[1255.5,392.3,21,"#FB7E77"],[1255.5,423.9,15,"#FD8177"],[1255.7,298.2,11,"#FB7A72"],[1256.6,133.1,4,"#F37B78"],[1256.6,199,4,"#FD9891"],[1256.6,232.7,4,"#EA8179"],[1256.6,269.8,8,"#F78B80"],[1256.7,169.9,4,"#F38F8D"],[1269.6,472,4,"#EE7E80"],[1281.1,445.3,11,"#F6807B"],[1281.4,171.3,4,"#EC8487"],[1281.4,513,4,"#F27883"],[1281.5,258.3,4,"#F4828C"],[1281.6,148.7,4,"#F08685"],[1281.8,193.9,4,"#F6938A"],[1282.5,320.7,21,"#FF756E"],[1282.5,351.9,21,"#FC847A"],[1282.5,383.2,21,"#FF7F75"],[1282.5,414.4,15,"#FB877E"],[1282.7,481.3,8,"#ED827D"],[1283.3,291.4,8,"#FA867B"],[1283.7,231.9,8,"#F88579"],[1307.8,234.1,11,"#F88078"],[1308.1,145,4,"#FA9593"],[1308.1,449.7,4,"#EA7A7C"],[1309.3,296.9,15,"#FB7A73"],[1309.3,327.8,21,"#FE7A6E"],[1309.3,358.8,21,"#FE756D"],[1309.3,389.7,15,"#FF776D"],[1309.5,177.7,4,"#FD8A82"],[1310,438.5,8,"#EE8B84"],[1310.1,421.5,11,"#F97872"],[1310.3,209.5,4,"#F39B89"],[1310.3,266.3,11,"#F98178"],[1334.6,212,8,"#FA8981"],[1335.2,185.6,4,"#EE9491"],[1335.2,241.8,8,"#F8867D"],[1335.8,273.6,15,"#FE796E"],[1335.8,304.2,21,"#FC6D66"],[1335.8,334.8,21,"#FB706B"],[1335.8,365.4,21,"#FE6F68"],[1335.8,396,15,"#FC706A"],[1336,424.5,8,"#F1867B"],[1336,441.5,8,"#EA857D"],[1336,455.7,4,"#F68585"],[1336.1,157.8,4,"#FA8C81"],[1348.8,210.4,8,"#F5837A"],[1361.7,205.9,4,"#FE9B8F"],[1361.8,146.1,4,"#F68C8F"],[1362,266,15,"#FB7D75"],[1362,296.3,21,"#FD7970"],[1362,326.5,21,"#FF7970"],[1362,356.8,21,"#FE7770"],[1362.1,119.2,4,"#F58480"],[1362.3,173.9,4,"#FF9791"],[1362.7,233.8,11,"#FB857B"],[1363,444.1,4,"#FF9189"],[1363,422.9,8,"#ED877F"],[1363,481.7,4,"#EF7B7A"],[1363.5,387.2,11,"#F08279"]];

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
            { autoAlpha: 1, y: 0, duration: TEXT.duration, delay: TEXT.delay, stagger: TEXT.stagger, ease: TEXT.ease }
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

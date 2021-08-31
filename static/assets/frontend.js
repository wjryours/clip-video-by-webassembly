class ClipVideo {
    constructor() {
        this.ffmpeg = null
        this.originFile = null
        this.handleFile = null
        this.vueInstance = null
        this.currentSliderValue = [0, 0]
        this.init()
    }
    init() {
        console.log('init')
        this.initFfmpeg()
        this.bindSelectOriginFile()
        this.bindOriginVideoLoad()
        this.bindClipBtn()
        this.initVueSlider()
    }
    initVueSlider(maxSliderValue = 100) {
        console.log(`maxSliderValue ${maxSliderValue}`)
        if (!this.vueInstance) {
            const _this = this
            const Main = {
                data() {
                    return {
                        value: [0, 0],
                        maxSliderValue: maxSliderValue
                    }
                },
                watch: {
                    value() {
                        _this.currentSliderValue = this.value
                    }
                },
                methods: {
                    formatTooltip(val) {
                        return _this.transformSecondToVideoFormat(val);
                    }
                }
            }
            const Ctor = Vue.extend(Main)
            this.vueInstance = new Ctor().$mount('#app')
        } else {
            this.vueInstance.maxSliderValue = maxSliderValue
            this.vueInstance.value = [0, 0]
        }
    }
    transformSecondToVideoFormat(value = 0) {
        const totalSecond = Number(value)
        let hours = Math.floor(totalSecond / (60 * 60))
        let minutes = Math.floor(totalSecond / 60) % 60
        let second = totalSecond % 60
        let hoursText = ''
        let minutesText = ''
        let secondText = ''
        if (hours < 10) {
            hoursText = `0${hours}`
        } else {
            hoursText = `${hours}`
        }
        if (minutes < 10) {
            minutesText = `0${minutes}`
        } else {
            minutesText = `${minutes}`
        }
        if (second < 10) {
            secondText = `0${second}`
        } else {
            secondText = `${second}`
        }
        return `${hoursText}:${minutesText}:${secondText}`
    }
    initFfmpeg() {
        const { createFFmpeg } = FFmpeg;
        this.ffmpeg = createFFmpeg({
            log: true,
            corePath: './assets/ffmpeg-core.js',
        });
    }
    bindSelectOriginFile() {
        $('#select_origin_file').on('change', (e) => {
            const file = e.target.files[0]
            this.originFile = file
            const url = window.webkitURL.createObjectURL(file)
            $('#origin-video').attr('src', url)

        })
    }
    bindOriginVideoLoad() {
        $('#origin-video').on('loadedmetadata', (e) => {
            const duration = Math.floor(e.target.duration)
            this.initVueSlider(duration)
        })
    }
    bindClipBtn() {
        $('#start_clip').on('click', () => {
            console.log('start clip')
            this.clipFile(this.originFile)
        })
    }
    async clipFile(file) {
        const { ffmpeg, currentSliderValue } = this
        const { fetchFile } = FFmpeg;
        const { name } = file;
        const startTime = this.transformSecondToVideoFormat(currentSliderValue[0])
        const endTime = this.transformSecondToVideoFormat(currentSliderValue[1])
        console.log('clipRange', startTime, endTime)
        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
        }
        ffmpeg.FS('writeFile', name, await fetchFile(file));
        await ffmpeg.run('-i', name, '-ss', startTime, '-to', endTime, 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const tempURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        $('#handle-video').attr('src', tempURL)
    }
}
$(document).ready(function () {
    const instance = new ClipVideo()
});

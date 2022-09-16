import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';

const PORT = process.env.PORT || 5473;
const app = express();

const sources = [
    {
        name: 'androidpolice',
        address: 'https://www.androidpolice.com/',
        base: true
    },
    {
        name: 'talkandroid',
        address: 'https://www.talkandroid.com/',
        base: false
    },
    {
        name: 'androidauthority',
        address: 'https://www.androidauthority.com/news/',
        base: false
    },
    {
        name: 'androidcentral',
        address: 'https://www.androidcentral.com/',
        base: false
    },
    {
        name: 'androidheadlines',
        address: 'https://www.androidheadlines.com/',
        base: false
    },
]

const articles: any[] = []

sources.forEach(async src => {
    const res = await axios.get(src.address);
    const html = await res.data;
    const $ = load(html);

    $('a:contains("games")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');

        articles.push({
            title,
            url: src.base ? src.address + url : url,
            source: src.name
        })
    })
})

app.get('/', (_, res) => {
    res.json('Welcome to the rest api')
})

app.get('/news', (_, res) => {
    res.json(articles)
})

app.get('/news/:singleSource', async ({ params }, res) => {
    const srcId = params.singleSource;
    const {address, base} = sources.find(s => s.name == srcId)!;
    const specificArticle: any[] = []
    const response = await axios.get(address);
    const html = response.data;
    const $ = load(html);

    $('a:contains("games")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');

        specificArticle.push({
            title,
            url: base ? address + url : url,
            source: srcId
        })
    })
    res.json(specificArticle)
})

app.listen(PORT, () => {
    console.log('Listening on PORT: ' + PORT)
})
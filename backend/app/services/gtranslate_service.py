import googletrans, asyncio

def translateViToEn(txt):
    return asyncio.run(_translate(txt, "vi", "en"))

def translateEnToVi(txt):
    return asyncio.run(_translate(txt, "en", "vi"))

async def _translate(txt, _src, _dest):
    res = ""
    async with googletrans.Translator() as translator:
        res = (await translator.translate(txt, src=_src, dest=_dest)).text
    return res
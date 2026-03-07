import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqkshcozrnqfbxreuczj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_m431429UTneqaTwUWFwvhQ_EpzC-nrB'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const dataRaw = `hawas kobra	 10,000.00 	 10,000.00 	0	1	decant	arabe	verano/primavera 	Sí
The kingdom femenino	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
liquid Brun	 9,000.00 	 9,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
Mercedes Benz black	 9,000.00 	 9,000.00 	0	1	decant	diseñador 	otoño/invierno 	Sí
one millón Privé	 16,500.00 	 16,500.00 	0	1	decant	diseñador 	otoño/invierno 	Sí
Turathi Brown	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
hawas ice	 9,000.00 	 9,000.00 	0	1	decant	arabe	verano/primavera 	Sí
Fire on ice	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
atlas	 12,500.00 	 12,500.00 	0	1	decant	arabe	verano/primavera 	Sí
opulent dubai	 8,000.00 	 8,000.00 	0	1	decant	arabe	verano/primavera 	Sí
corium	 9,000.00 	 9,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
Erba pura	 25,000.00 	 25,000.00 	0	1	decant	nicho	verano/primavera 	Sí
Versace Pour homme	 9,000.00 	 9,000.00 	0	1	decant	diseñador 	verano/primavera 	Sí
light blue DG	 9,000.00 	 9,000.00 	0	1	decant	diseñador 	verano/primavera 	Sí
hawas malibu	 10,000.00 	 10,000.00 	0	1	decant	arabe	verano/primavera 	Sí
date for men	 16,500.00 	 16,500.00 	0	1	decant	nicho	verano/primavera 	Sí
asad Zanzibar	 7,500.00 	 7,500.00 	0	1	decant	arabe	verano/primavera 	Sí
hawas tropical	 10,000.00 	 10,000.00 	0	1	decant	arabe	verano/primavera 	Sí
Italian Pour homme	 9,000.00 	 9,000.00 	0	1	decant	arabe	verano/primavera 	Sí
jungle vibes	 9,000.00 	 9,000.00 	0	1	decant	arabe	verano/primavera 	Sí
asad	 7,500.00 	 7,500.00 	0	1	decant	arabe	otoño/invierno 	Sí
crimson	 9,000.00 	 9,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
Le male elixir absolu	 13,000.00 	 13,000.00 	0	1	decant	diseñador 	otoño/invierno 	Sí
vintage radio	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
asad elixir	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
mandarin sky	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
9 am dive	 8,000.00 	 8,000.00 	0	1	decant	arabe	verano/primavera 	Sí
honor And glory	 8,000.00 	 8,000.00 	0	1	decant	arabe	otoño/invierno 	Sí
viking Cairo	 85,000.00 	 85,000.00 	0	1	sellado	arabe	verano/primavera 	Sí
Pharaom Ramsés II	 135,000.00 	 135,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
Niche Parfum	 68,000.00 	 68,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
viking rio	 85,000.00 	 85,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
Pharaom Ramsés I	 135,000.00 	 135,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
Bharara Bleu	 85,000.00 	 85,000.00 	0	1	sellado	arabe	verano/primavera 	Sí
The collection Kit x7	 88,000.00 	 88,000.00 	0	1	sellado	arabe	todo el año	Sí
Viking Beirut	 85,000.00 	 85,000.00 	0	1	sellado	arabe	verano/primavera 	Sí
viking Kashmir	 85,000.00 	 85,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
bharara queen	 83,000.00 	 83,000.00 	0	1	sellado	diseñador	otoño/invierno 	Sí
Antonio Banderas  The icon	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio Banderas Blue seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonicret banderas her secret gold	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	otoño/invierno 	Sí
Antonio Banderas The secret gold	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	otoño/invierno 	Sí
Antonio banderas king absolut	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio BanderasThe icon supreme femenino	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio BanDesiree er secret desiree	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio Banderas Blue seduction femenino	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio Banderas secret temtampion	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	otoño/invierno 	Sí
Antonio Banderas king seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
Antonio Banderas  power of seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador	verano/primavera 	Sí
date for men	 140.00 	 140.00 	0	1	sellado	nicho	verano/primavera 	Sí
hawas ice	 70,000.00 	 70,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
hawas tropical	 80,000.00 	 80,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Fire on ice	 55,000.00 	 55,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
vintage radio	 55,000.00 	 55,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
asad	 45,000.00 	 45,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Erba pura	 220.00 	 220.00 	0	1	sellado	nicho 	verano/primavera 	Sí
Le male elixir absolu	 180,000.00 	 180,000.00 	0	1	sellado	diseñador 	otoño/invierno 	Sí
asad elixir	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
light blue DG	 80,000.00 	 80,000.00 	0	1	sellado	diseñador 	verano/primavera 	Sí
hawas malibu	 85,000.00 	 85,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
atlas	 58,000.00 	 58,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
jungle vibes	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
corium	 63,000.00 	 63,000.00 	0	1	sellado	arabe	otoño/invierno 	Sí
Mercedes Benz black	 75,000.00 	 75,000.00 	0	1	sellado	diseñador 	otoño/invierno 	Sí
liquid Brun	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Italian Pour homme	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
9 am dive	 55,000.00 	 55,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
crimson	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
honor And glory	 48,000.00 	 48,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Turathi Brown	 58,000.00 	 58,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
hawas kobra	 85,000.00 	 85,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
asad Zanzibar	 45,000.00 	 45,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
opulent dubai	 45,000.00 	 45,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Versace Pour homme	 80,000.00 	 80,000.00 	0	1	sellado	diseñador 	verano/primavera 	Sí
mandarin sky	 580,000.00 	 580,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
The kingdom femenino	 55,000.00 	 55,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Beach party	 68,000.00 	 68,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Club de nuit icónic	 75,000.00 	 75,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
island bliss	 73,000.00 	 73,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
club de nuit Precieux I	 88,000.00 	 88,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
l aventure iris	 70,000.00 	 70,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
club de nuit untold	 80,000.00 	 80,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
club de nuit Bling	 95,000.00 	 95,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Blue sky	 70,000.00 	 70,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Amber oud gold 999.9 Dubai edition	 100,000.00 	 100,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Amber oud Dubai night	 88,000.00 	 88,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Amber oud White	 91,000.00 	 91,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Olaf	 70,000.00 	 70,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Palm Dubai	 65,000.00 	 65,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
l aventure iris	 70,000.00 	 70,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Amber oud Carbon	 91,000.00 	 91,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Amber oud gold 999.9 Dubai edition	 100,000.00 	 100,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Amber oud gold edition	 88,000.00 	 88,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Manege Blanche	 68,000.00 	 68,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
club de nuit untold	 80,000.00 	 80,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Club de nuit icónic	 75,000.00 	 75,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
club de nuit Bling	 95,000.00 	 95,000.00 	0	1	sellado	árabe 		Sí
l aventure iris	 70,000.00 	 70,000.00 	0	1	sellado	árabe 		Sí
club de nuit Precieux I	 88,000.00 	 88,000.00 	0	1	sellado	árabe 		Sí
island bliss	 73,000.00 	 73,000.00 	0	1	sellado	árabe 		Sí
Amber oud gold 999.9 Dubai edition	 100,000.00 	 100,000.00 	0	1	sellado	árabe 		Sí
Blue sky	 70,000.00 	 70,000.00 	0	1	sellado	árabe 		Sí
Antonio Banderas Blue seduction femenino	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio BanDesiree er secret desiree	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas The secret gold	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas  The icon	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas secret temtampion	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas king seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas  power of seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio banderas king absolut	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonicret banderas her secret gold	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio BanderasThe icon supreme femenino	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
Antonio Banderas Blue seduction	 30,000.00 	 30,000.00 	0	1	sellado	diseñador 		Sí
qaed al fursan untamed	 35,000.00 	 35,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
The kingdom	 62,500.00 	 62,500.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Mayar natural intense	 50,000.00 	 50,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Musaman white intense	 43,000.00 	 43,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Sakeena	 48,000.00 	 48,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
King of Arabian	 -   	 -   	0	1	sellado	árabe 	otoño/invierno 	Sí
Qaed al fursan	 37,000.00 	 37,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Sehr	 55,000.00 	 55,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
qaed al fursan unlimited	 35,000.00 	 35,000.00 	0	1	sellado	árabe 	verano/primavera 	Sí
Khamrah dukhan	 50,000.00 	 50,000.00 	0	1	sellado	árabe 	otoño/invierno 	Sí
Producto de Prueba	 3,434.00 	 3,434.00 	334	31				Sí
juan	 23.00 	 23.00 	0	0				Sí`

function cleanNumber(str) {
    if (!str) return 0
    let clean = str.replace(/[$,\s]/g, '').replace(/-/g, '')
    if (clean === '') return 0
    return parseFloat(clean)
}

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
}

async function runImport() {
    const lines = dataRaw.split('\n').filter(l => l.trim() !== '')
    const cache = {
        categories: {},
    }

    // Cargar categorías existentes
    const { data: existingCats } = await supabase.from('categories').select('id, name')
    existingCats?.forEach(c => {
        cache.categories[c.name.toLowerCase()] = c.id
    })

    console.log(`Iniciando importación de ${lines.length} productos...`)

    for (const line of lines) {
        const parts = line.split('\t').map(p => p.trim())
        if (parts.length < 9) continue

        const [nombre, precioStr, precioOrigStr, costoStr, stockStr, decantSellado, categoria, subcategoria, publicado] = parts

        const name = nombre
        const price = cleanNumber(precioStr)
        const original_price = cleanNumber(precioOrigStr)
        const cost = cleanNumber(costoStr)
        const stock = parseInt(stockStr) || 0
        const is_published = publicado.toLowerCase() === 'sí' || publicado.toLowerCase() === 'si'

        // Normalizar nombres de categoría
        let categoryName = categoria || 'General'
        if (categoryName.toLowerCase() === 'árabe') categoryName = 'arabe' // Consistencia

        // Obtener o crear ID de categoría
        let categoryId = cache.categories[categoryName.toLowerCase()]
        if (!categoryId) {
            const { data: newCat, error: catError } = await supabase
                .from('categories')
                .insert({
                    name: categoryName,
                    slug: slugify(categoryName),
                    display_order: 10
                })
                .select('id')
                .single()

            if (catError) {
                console.error(`Error creando categoría ${categoryName}:`, catError)
                continue
            }
            categoryId = newCat.id
            cache.categories[categoryName.toLowerCase()] = categoryId
            console.log(`Categoría creada: ${categoryName}`)
        }

        // Buscar si el producto ya existe
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id, image, additional_images')
            .eq('name', name)
            .maybeSingle()

        const productData = {
            name,
            price,
            original_price,
            cost,
            stock,
            category: categoryName,
            category_id: categoryId,
            category_name: categoryName,
            subcategory: subcategoria,
            subcategory_name: subcategoria,
            is_published,
            specifications: { tipo: decantSellado },
            updated_at: new Date().toISOString()
        }

        if (existingProduct) {
            // Actualizar preservando imágenes
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', existingProduct.id)

            if (updateError) {
                console.error(`Error actualizando ${name}:`, updateError)
            } else {
                console.log(`Producto actualizado: ${name}`)
            }
        } else {
            // Crear nuevo
            const { error: insertError } = await supabase
                .from('products')
                .insert({
                    ...productData,
                    created_at: new Date().toISOString()
                })

            if (insertError) {
                console.error(`Error insertando ${name}:`, insertError)
            } else {
                console.log(`Producto creado: ${name}`)
            }
        }
    }

    console.log('¡Importación finalizada!')
}

runImport()

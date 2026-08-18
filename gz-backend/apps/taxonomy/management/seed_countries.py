from django.core.management.base import BaseCommand
from apps.taxonomy.models import Country, Genre, Category, SeriesType  # ← បន្ថែម SeriesType


class Command(BaseCommand):
    help = 'បន្ថែមប្រទេស ប្រភេទរឿង ក្រុម និងប្រភេទរឿងភាគដំបូង'

    def handle(self, *args, **options):
        # ប្រទេស
        countries = [
            {'name': 'ខ្មែរ', 'flag': '🇰🇭'},
            {'name': 'ចិន', 'flag': '🇨🇳'},
            {'name': 'កូរេ', 'flag': '🇰🇷'},
            {'name': 'ថៃ', 'flag': '🇹🇭'},
            {'name': 'ជប៉ុន', 'flag': '🇯🇵'},
            {'name': 'ឥណ្ឌា', 'flag': '🇮🇳'},
            {'name': 'អាមេរិក', 'flag': '🇺🇸'},
            {'name': 'អង់គ្លេស', 'flag': '🇬🇧'},
            {'name': 'បារាំង', 'flag': '🇫🇷'},
            {'name': 'អាល្លឺម៉ង់', 'flag': '🇩🇪'},
            {'name': 'អេស្ប៉ាញ', 'flag': '🇪🇸'},
            {'name': 'រុស្ស៊ី', 'flag': '🇷🇺'},
            {'name': 'វៀតណាម', 'flag': '🇻🇳'},
            {'name': 'ឡាវ', 'flag': '🇱🇦'},
            {'name': 'ម៉ាឡេស៊ី', 'flag': '🇲🇾'},
            {'name': 'ឥណ្ឌូនេស៊ី', 'flag': '🇮🇩'},
            {'name': 'ហ្វីលីពីន', 'flag': '🇵🇭'},
            {'name': 'តួកគី', 'flag': '🇹🇷'},
            {'name': 'ប្រេស៊ីល', 'flag': '🇧🇷'},
            {'name': 'ម៉ិកស៊ិក', 'flag': '🇲🇽'},
        ]
        
        for country_data in countries:
            country, created = Country.objects.get_or_create(
                name=country_data['name'],
                defaults={'flag': country_data.get('flag', '')}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ បន្ថែមប្រទេស: {country.name} {country.flag}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ មានរួចហើយ: {country.name}'))
        
        # ប្រភេទរឿង
        genres = [
            'Action', 'Comedy', 'Drama', 'Horror', 'Romance',
            'Sci-Fi', 'Thriller', 'Adventure', 'Animation',
            'Documentary', 'Mystery', 'Crime', 'Fantasy',
            'Family', 'History', 'War', 'Musical',
        ]
        
        for genre_name in genres:
            genre, created = Genre.objects.get_or_create(name=genre_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ បន្ថែមប្រភេទ: {genre.name}'))
        
        # ក្រុមផ្សេងៗ
        categories = [
            'និយាយខ្មែរ',
            'មិនគិតថ្លៃ',
            'ពេញនិយម',
            'ថ្មីៗ',
            'កុមារ',
            'គ្រួសារ',
        ]
        
        for category_name in categories:
            category, created = Category.objects.get_or_create(name=category_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ បន្ថែមក្រុម: {category.name}'))
        
        # ============ បន្ថែមប្រភេទរឿងភាគ ============
        series_types = [
            {'name': 'រឿងភាគចិន', 'flag': '🇨🇳'},
            {'name': 'រឿងភាគហូលីវូត', 'flag': '🇺🇸'},
            {'name': 'រឿងភាគកូរ៉េ', 'flag': '🇰🇷'},
            {'name': 'រឿងភាគថៃ', 'flag': '🇹🇭'},
            {'name': 'រឿងភាគជប៉ុន', 'flag': '🇯🇵'},
            {'name': 'រឿងភាគខ្មែរ', 'flag': '🇰🇭'},
            {'name': 'រឿងភាគឥណ្ឌា', 'flag': '🇮🇳'},
            {'name': 'រឿងភាគតួកគី', 'flag': '🇹🇷'},
        ]
        
        for series_type_data in series_types:
            series_type, created = SeriesType.objects.get_or_create(
                name=series_type_data['name'],
                defaults={'flag': series_type_data.get('flag', '')}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ បន្ថែមប្រភេទរឿងភាគ: {series_type.name} {series_type.flag}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ មានរួចហើយ: {series_type.name}'))
        # ============ បញ្ចប់ការបន្ថែម ============
        
        self.stdout.write(self.style.SUCCESS('\n🎉 បន្ថែមទិន្នន័យដំបូងបានសម្រេច!'))
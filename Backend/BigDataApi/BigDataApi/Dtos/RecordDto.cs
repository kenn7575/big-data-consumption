namespace BigDataApi.Dtos
{
    public class RecordDto
    {
        public string Name { get; set; }
        public DateOnly Date { get; set; }
        public int Points { get; set; }
    }

    public class RecordDtoCountryAndRank
    {
        public string? Country { get; set; }
        public int? DailyRank { get; set; }
    }
}

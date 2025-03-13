namespace BigDataApi.Dtos
{
    public class NodeDto
    {
        public string Name { get; set; }
        public List<NodeDto> Children { get; set; } = new List<NodeDto>();
    }
}

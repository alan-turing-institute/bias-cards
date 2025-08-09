export interface CardData {
  id: string;
  name: string;
  title: string;
  description: string;
  example: string;
  prompts: string[];
  icon: string;
  caption: string;
  displayNumber?: string;
}

export interface CardMetadata {
  id: string;
  name: string;
  category: string;
  type: string;
  createdAt?: string;
  lastModified?: string;
  tags?: string[];
}

export abstract class BaseCard {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly example: string;
  readonly prompts: string[];
  readonly icon: string;
  readonly caption: string;

  abstract readonly category: string;
  abstract readonly type: 'bias' | 'mitigation' | 'case-study' | 'custom';

  constructor(data: CardData) {
    this.id = data.id;
    this.name = data.name;
    this.title = data.title;
    this.description = data.description;
    this.example = data.example;
    this.prompts = data.prompts;
    this.icon = data.icon;
    this.caption = data.caption;
  }

  abstract validate(): boolean;

  toJSON(): CardData {
    return {
      id: this.id,
      name: this.name,
      title: this.title,
      description: this.description,
      example: this.example,
      prompts: this.prompts,
      icon: this.icon,
      caption: this.caption,
    };
  }

  matches(query: string): boolean {
    const searchQuery = query.toLowerCase();
    return (
      this.name.toLowerCase().includes(searchQuery) ||
      this.title.toLowerCase().includes(searchQuery) ||
      this.description.toLowerCase().includes(searchQuery) ||
      this.caption.toLowerCase().includes(searchQuery) ||
      this.example.toLowerCase().includes(searchQuery)
    );
  }

  getMetadata(): CardMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      type: this.type,
    };
  }
}

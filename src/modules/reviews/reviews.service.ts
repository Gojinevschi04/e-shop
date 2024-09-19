import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Review } from './review.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { REVIEW_PAGINATION_CONFIG } from './config-review';
import { plainToInstance } from 'class-transformer';
import { ReviewDto } from './review.dto';
import { NewReviewDto } from './new-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(newReviewDto: NewReviewDto, user: User): Promise<ReviewDto> {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productsRepository.findOneBy({
      id: newReviewDto.productId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = plainToInstance(Review, newReviewDto);
    review.user = user;
    review.product = product;
    console.log(review);

    return plainToInstance(
      ReviewDto,
      await this.reviewsRepository.save(review),
    );
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Review>> {
    return await paginate(
      query,
      this.reviewsRepository,
      REVIEW_PAGINATION_CONFIG,
    );
  }

  async findAllByProduct(productId: number): Promise<Review[] | null> {
    return await this.reviewsRepository.findBy({ product: { id: productId } });
  }

  async update(
    id: number,
    updateReviewDto: ReviewDto,
    user: User,
  ): Promise<ReviewDto | null> {
    let oldReviewData = await this.reviewsRepository.findOneBy({
      id: id,
    });

    if (oldReviewData == null) {
      throw new BadRequestException('Nonexistent review to update');
    }
    if (oldReviewData.product.id != updateReviewDto.productId) {
      throw new BadRequestException('Invalid product id');
    }
    if (updateReviewDto.userId != user.id) {
      throw new BadRequestException('Invalid user id');
    }

    oldReviewData = this.reviewsRepository.merge(
      oldReviewData,
      updateReviewDto,
    );

    const product = await this.productsRepository.findOneBy({
      id: updateReviewDto.productId,
    });

    if (product == null) {
      throw new BadRequestException('Nonexistent product');
    }

    oldReviewData.product = product;

    return plainToInstance(
      ReviewDto,
      this.reviewsRepository.save(oldReviewData),
    );
  }

  async remove(id: number): Promise<void> {
    const reviewData = await this.reviewsRepository.findOneBy({
      id: id,
    });

    if (reviewData == null) {
      throw new BadRequestException('Nonexistent review to delete');
    }
    await this.reviewsRepository.delete(id);
    return;
  }
}
